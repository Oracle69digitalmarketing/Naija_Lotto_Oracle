# How-To: Deploy Your Live AWS Amplify Backend

This guide provides the step-by-step instructions to create, configure, and deploy the secure serverless backend for the Naija Lotto Oracle application. This will transform the app from a frontend prototype into a fully functional, production-ready system using a pure AWS stack.

**Prerequisites:**
1.  An [AWS Account](https://aws.amazon.com/premiumsupport/knowledge-center/create-and-activate-aws-account/).
2.  [Node.js](https://nodejs.org/en/download/) installed on your machine.
3.  The [Amplify CLI](https://docs.amplify.aws/cli/start/install/) installed and configured with your AWS credentials.
4.  Access to Claude 3 Sonnet enabled in [Amazon Bedrock](https://docs.aws.amazon.com/bedrock/latest/userguide/model-access.html) in your chosen AWS region.

---

### Step 1: Initialize Amplify in Your Project

First, navigate to your project's root directory in your terminal and run the `amplify init` command. This will set up the Amplify project in the cloud.

```bash
amplify init
```
Follow the prompts:
-   **Enter a name for the project:** `NaijaLottoOracle`
-   **Enter a name for the environment:** `prod` (for production)
-   **Choose your default editor:** Select your preferred code editor.
-   **Choose the type of app you're building:** `javascript`
-   **What javascript framework are you using:** `react`
-   **Source Directory Path:** `.`
-   **Distribution Directory Path:** `build` (or your build output directory)
-   **Build Command:** `npm run build`
-   **Start Command:** `npm start`
-   **Do you want to use an AWS profile?** `Yes`, and select the profile you configured during CLI setup.

Amplify will now create the necessary cloud resources. It will also generate an `aws-exports.js` file, which is already present in your project.

---

### Step 2: Add Authentication (Amazon Cognito)

Next, we'll add user authentication. This command will set up an Amazon Cognito User Pool to securely manage user accounts.

```bash
amplify add auth
```
Follow the prompts:
-   **Do you want to use the default authentication and security configuration?** `Default configuration with Social Provider (Federation)`
-   **How do you want users to be able to sign in?** `Email`
-   **Do you want to configure advanced settings?** `No, I am done.`

This sets up everything needed for user sign-up, sign-in, and session management.

---

### Step 3: Add the Backend API (API Gateway + Lambda)

This is the most critical step. We will create a secure REST API that the frontend can call. This API will be protected, requiring users to be logged in.

```bash
amplify add api
```
Follow the prompts:
-   **Please select from one of the below services:** `REST`
-   **Provide a friendly name for your resource:** `NaijaLottoOracleAPI` (This must match the `apiName` in `services/geminiService.ts`)
-   **Provide a path:** `/predictions`
-   **Choose a Lambda source:** `Create a new Lambda function`
-   **Provide a friendly name for your Lambda function:** `lottoPredictor`
-   **Choose the function runtime that you want to use:** `NodeJS`
-   **Choose the function template that you want to use:** `Hello World`
-   **Do you want to configure advanced settings?** `No`
-   **Do you want to edit the local Lambda function now?** `Yes`

Your code editor will open the new Lambda function's folder (`amplify/backend/function/lottoPredictor/src/index.js`).

**Now, add a second path for the number analyzer:**
-   **Restrict API access?** `Yes`
-   **Who should have access?** `Authenticated users only`
-   **What kind of access do you want for Authenticated users?** `create` (for POST requests)
-   **Do you want to add another path?** `Yes`
-   **Provide a path:** `/analyze`
-   **Choose a Lambda source:** Select the function you just created (`lottoPredictor`).
-   **Restrict API access?** `Yes`
-   **Who should have access?** `Authenticated users only`
-   **What kind of access do you want for Authenticated users?** `create`
-   **Do you want to add another path?** `No`

Your API is now configured with two endpoints (`/predictions` and `/analyze`) that both trigger the same Lambda function.

---

### Step 4: Write the Lambda Function Logic (with AWS Bedrock)

Now, we'll replace the "Hello World" code in your Lambda function with the actual AI logic using Claude 3 Sonnet.

1.  **Navigate to the Lambda folder:**
    ```bash
    cd amplify/backend/function/lottoPredictor/src/
    ```

2.  **Install AWS SDK:** The AWS SDK for Bedrock needs to be a dependency for your function.
    ```bash
    npm install @aws-sdk/client-bedrock-runtime
    ```

3.  **Replace `index.js`:** Open `amplify/backend/function/lottoPredictor/src/index.js` and replace its entire content with the code below.

```javascript
// amplify/backend/function/lottoPredictor/src/index.js
const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");

// The Bedrock client will use the Lambda's IAM role for permissions (see Step 5)
// Ensure your Lambda is in a region where Claude 3 Sonnet is available, e.g., us-east-1
const client = new BedrockRuntimeClient({ region: "us-east-1" });
const modelId = "anthropic.claude-3-sonnet-20240229-v1:0";

const generatePrompt = (game, mode, year, number = null) => {
    const analysisPeriod = mode === 'allYears' ? "using all available historical data" : `focusing on data from the year ${year}`;
    
    // For Claude, the prompt structure is a bit different. We provide a system prompt and user message.
    let userMessage;
    let systemPrompt = "You are an expert Nigerian lotto bookmaker. Analyze the provided historical data context and respond ONLY with a valid JSON object matching the requested structure. Do not include any text outside of the JSON object."

    if (number) { // This is for the /analyze endpoint
        userMessage = `A user wants to know about their lucky number: ${number}.
            Analyze the historical data for the "${game}" lotto, ${analysisPeriod}.
            
            Provide a detailed "Bookmaker's Insight" on this number. Your analysis must include:
            1. Status: Is the number "Hot" (frequent), "Cold" (infrequent), or "Overdue" (statistically due)?
            2. Frequency: How many times has it appeared in the dataset?
            
            The JSON structure must be: { "analysis": "...", "status": "Hot" | "Cold" | "Overdue" | "Neutral", "frequency": 0 }`;
    } else { // This is for the /predictions endpoint
        userMessage = `Analyze the historical data for the "${game}" lotto, ${analysisPeriod}.
        Your analysis should consider Hot, Cold, and Overdue numbers.
        Provide the top 5 most likely numbers and a "Bookmaker's Insight" explaining your reasoning.

        The JSON structure must be: { "predictions": [{ "number": 0, "probability": 0.0 }], "analysis": "..." }`;
    }

    return { systemPrompt, userMessage };
};

exports.handler = async (event) => {
    try {
        const path = event.path;
        const body = JSON.parse(event.body);
        const { game, mode, year, number } = body;

        const { systemPrompt, userMessage } = generatePrompt(game, mode, year, number);
        
        const bedrockRequestPayload = {
            anthropic_version: "bedrock-2023-05-31",
            max_tokens: 2000,
            system: systemPrompt,
            messages: [{ "role": "user", "content": userMessage }]
        };

        const command = new InvokeModelCommand({
            modelId,
            contentType: "application/json",
            accept: "application/json",
            body: JSON.stringify(bedrockRequestPayload)
        });
        
        const apiResponse = await client.send(command);
        const decodedBody = new TextDecoder().decode(apiResponse.body);
        const responseBody = JSON.parse(decodedBody);
        
        // The actual JSON content from Claude is in the first content block
        const responseJson = JSON.parse(responseBody.content[0].text);

        return {
            statusCode: 200,
            headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*" },
            body: JSON.stringify(responseJson),
        };

    } catch (error) {
        console.error("Error calling Bedrock service:", error);
        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*" },
            body: JSON.stringify({ message: "Failed to get a response from the Oracle via Bedrock." }),
        };
    }
};
```

---

### Step 5: Securely Configure the Lambda Function

The Lambda function needs permission to call the Bedrock service.

```bash
amplify update function
```
-   **Select which capability you want to update:** `Resource access permissions`
-   **Select the category:** `predictions`
-   **Select the resource:** `bedrock` (If not listed, you may need to add this permission manually via the AWS Console in the Lambda's IAM role)
-   **Select the operations you want to permit:** `InvokeModel`

This grants the Lambda function an IAM role that allows it to securely invoke the Claude 3 model in Bedrock without needing any hardcoded API keys.

---

### Step 6: Deploy to the Cloud

You have configured everything. Now, push your backend to the AWS cloud.

```bash
amplify push
```

Amplify will show you a table of the resources it will create (Auth, API, Function). Confirm by typing `Y` and pressing Enter. This process can take a few minutes.

Once it's complete, your backend is **LIVE**.

---

### Step 7: Launch and Test Your App

Your frontend is already configured via `aws-exports.js` to talk to this new backend. Simply run your app locally or deploy the frontend to Amplify Hosting.

```bash
npm start
```

When you create an account and click "Get Lucky Numbers", you will be making a live, secure call to your AWS Lambda function, which will then call Amazon Bedrock to get a real prediction from Claude 3 Sonnet.

**Congratulations! You have a fully deployed, secure, and scalable AI application on a pure AWS stack.**
