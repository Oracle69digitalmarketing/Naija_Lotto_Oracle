import json
import boto3
import os
from datetime import datetime

bedrock_client = boto3.client('bedrock-runtime', region_name=os.environ.get('AWS_REGION', 'us-east-1'))

MODEL_ID = os.environ.get('BEDROCK_MODEL_ID', 'claude-3-5-sonnet-20241022')

def lambda_handler(event, context):
    """
    Lambda handler for analyzing individual lottery numbers using Claude Sonnet via AWS Bedrock.
    """
    try:
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        game = body.get('game', 'Premier Star')
        mode = body.get('mode', 'singleYear')
        year = body.get('year', datetime.now().year)
        number = body.get('number')
        
        # Validate inputs
        if number is None or not game or not mode or not year:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Missing required fields: game, mode, year, number'})
            }
        
        if not (0 <= number <= 49):
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Number must be between 0 and 49'})
            }
        
        # Create prompt for Claude
        prompt = generate_analysis_prompt(game, number, mode, year)
        
        # Call Claude via Bedrock
        response = bedrock_client.invoke_model(
            modelId=MODEL_ID,
            contentType='application/json',
            accept='application/json',
            body=json.dumps({
                'anthropic_version': 'bedrock-2023-06-01',
                'max_tokens': 1024,
                'messages': [
                    {
                        'role': 'user',
                        'content': prompt
                    }
                ]
            })
        )
        
        # Parse Claude response
        response_body = json.loads(response['body'].read().decode('utf-8'))
        claude_response = response_body['content'][0]['text']
        
        # Extract analysis and status
        analysis = claude_response
        status = extract_status(claude_response)
        frequency = extract_frequency(claude_response)
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'number': number,
                'game': game,
                'mode': mode,
                'year': year,
                'analysis': analysis,
                'status': status,
                'frequency': frequency,
                'timestamp': datetime.utcnow().isoformat()
            })
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': str(e),
                'message': 'Failed to analyze number'
            })
        }

def generate_analysis_prompt(game, number, mode, year):
    """Generate prompt for Claude to analyze a specific lottery number."""
    if mode == 'singleYear':
        return f"""You are an expert lottery analyst for the {game} lottery.

Analyze the number {number} in the context of {game} lottery data for {year}.

Determine if this number is:
1. HOT (frequently drawn recently)
2. COLD (rarely drawn recently)
3. OVERDUE (hasn't been drawn but statistically should be)
4. NEUTRAL (normal frequency)

Also calculate:
- Approximate frequency (how many times drawn, as a percentage)
- Trend analysis
- Next likely appearance

Format your response with these exact sections:
STATUS: [HOT/COLD/OVERDUE/NEUTRAL]
FREQUENCY: [percentage as number like 45.5]
ANALYSIS: [detailed analysis of number {number}]"""
    else:  # allYears
        return f"""You are an expert lottery analyst for the {game} lottery.

Analyze the number {number} using ALL historical {game} lottery data across all years.

Determine if this number is:
1. HOT (historically frequently drawn)
2. COLD (historically rarely drawn)
3. OVERDUE (hasn't been drawn but statistically should be)
4. NEUTRAL (normal historical frequency)

Also calculate:
- All-time frequency (percentage of times drawn across history)
- Historical trend
- Statistical significance

Format your response with these exact sections:
STATUS: [HOT/COLD/OVERDUE/NEUTRAL]
FREQUENCY: [percentage as number like 45.5]
ANALYSIS: [detailed analysis of number {number} across all historical data]"""

def extract_status(response_text):
    """Extract status from Claude's response."""
    statuses = ['HOT', 'COLD', 'OVERDUE', 'NEUTRAL']
    for status in statuses:
        if status in response_text.upper():
            return status
    return 'NEUTRAL'  # Default status

def extract_frequency(response_text):
    """Extract frequency percentage from Claude's response."""
    import re
    try:
        # Look for FREQUENCY: pattern
        match = re.search(r'FREQUENCY:\s*([\d.]+)', response_text, re.IGNORECASE)
        if match:
            return float(match.group(1))
        # Fallback: look for any percentage-like number
        match = re.search(r'(\d+(?:\.\d+)?)\s*%', response_text)
        if match:
            return float(match.group(1))
        return 50.0  # Default frequency
    except Exception as e:
        print(f"Error extracting frequency: {str(e)}")
        return 50.0
