# How-To: Deploy Your Live AWS Amplify Backend

This guide provides the step-by-step instructions to create, configure, and deploy the secure serverless backend for the Naija Lotto Oracle application. This will transform the app from a frontend prototype into a fully functional, production-ready system.

**Prerequisites:**
1.  An [AWS Account](https://aws.amazon.com/premiumsupport/knowledge-center/create-and-activate-aws-account/).
2.  [Node.js](https://nodejs.org/en/download/) installed on your machine.
3.  The [Amplify CLI](https://docs.amplify.aws/cli/start/install/) installed and configured.
4.  Your AI Service API Key (either from Google for Gemini or have AWS credentials configured for Amazon Bedrock).

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
-   **Do you want to use the default authentication and security configuration?** `Default configuration`
-   **How do you want users to be able to sign in?** `Email`
-   **Do you want to configure advanced settings?** `No, I am done.`

This sets up everything needed for user sign-up, sign-in, and session management. The frontend `withAuthenticator` component will now work with this live service.

---

### Step 3: Add the Backend API (API Gateway + Lambda)

This is the most critical step. We will create a secure REST API that the frontend can call. This API will be protected, requiring users to be logged in.

```bash
amplify add api
```
Follow the prompts:
-   **Please select from one of the below services:** `REST`
-   **Provide a friendly name for your resource:** `NaijaLottoOracleAPI` (This should match the `apiName` in `services/geminiService.ts`)
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

### Step 4: Write the Lambda Function Logic

Now, we'll replace the "Hello World" code in your Lambda function with the actual AI logic.

1.  **Navigate to the Lambda folder:**
    ```bash
    cd amplify/backend/function/lottoPredictor/src/
    ```

2.  **Install AI SDK:** You need to add the AI library to your Lambda's dependencies.
    -   **For Gemini:** `npm install @google/genai`
    -   **For Claude/Bedrock:** `npm install @aws-sdk/client-bedrock-runtime`

3.  **Replace `index.js`:** Open `amplify/backend/function/lottoPredictor/src/index.js` and replace its entire content with the code below. **Choose ONE of the AI options.**

#### Option A: Using Google Gemini (Requires Gemini API Key)

```javascript
// amplify/backend/function/lottoPredictor/src/index.js
const { GoogleGenAI, Type } = require('@google/genai');

// Store your key securely in Amplify's environment variables (see Step 5)
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const generatePrompt = (game, mode, year, number = null) => {
    const analysisPeriod = mode === 'allYears' ? "using all available historical data" : `focusing on data from the year ${year}`;
    if (number) { // This is for the /analyze endpoint
        return `
            Act as an expert Nigerian lotto bookmaker. A user wants to know about their lucky number: ${number}.
            Analyze the historical data for the "${game}" lotto, ${analysisPeriod}.
            
            Provide a detailed "Bookmaker's Insight" on this number. Your analysis must include:
            1. Status: Is the number "Hot" (frequent), "Cold" (infrequent), or "Overdue" (statistically due)?
            2. Frequency: How many times has it appeared in the dataset?
        `;
    }
    // This is for the /predictions endpoint
    return `
        Act as an expert Nigerian lotto bookmaker. Analyze the historical data for the "${game}" lotto, ${analysisPeriod}.
        Your analysis should consider Hot, Cold, and Overdue numbers.
        Provide the top 5 most likely numbers and a "Bookmaker's Insight" explaining your reasoning.
    `;
};

exports.handler = async (event) => {
    const path = event.path;
    const body = JSON.parse(event.body);
    const { game, mode, year, number } = body;

    let responseSchema;
    if (path === '/analyze') {
        responseSchema = {
            type: Type.OBJECT, properties: { analysis: { type: Type.STRING }, status: { type: Type.STRING }, frequency: { type: Type.NUMBER } }, required: ["analysis", "status", "frequency"]
        };
    } else { // /predictions
        responseSchema = {
            type: Type.OBJECT, properties: { predictions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { number: { type: Type.NUMBER }, probability: { type: Type.NUMBER } }, required: ["number", "probability"] } }, analysis: { type: Type.STRING } }, required: ["predictions", "analysis"]
        };
    }

    try {
        const prompt = generatePrompt(game, mode, year, number);
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: responseSchema },
        });

        return {
            statusCode: 200,
            headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*" },
            body: response.text,
        };
    } catch (error) {
        console.error("Error calling AI service:", error);
        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*" },
            body: JSON.stringify({ message: "Failed to get a response from the Oracle." }),
        };
    }
};
```

#### Option B: Using AWS Bedrock + Claude 3 Sonnet (Pure AWS Stack)

```javascript
// amplify/backend/function/lottoPredictor/src/index.js
const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");

// Bedrock client will use the Lambda's IAM role for permissions (see Step 5)
const client = new BedrockRuntimeClient({ region: "us-east-1" }); // Or your preferred region
const modelId = "anthropic.claude-3-sonnet-20240229-v1:0";

const generatePrompt = (game, mode, year, number = null) => {
    // This function is identical to the Gemini version.
    const analysisPeriod = mode === 'allYears' ? "using all available historical data" : `focusing on data from the year ${year}`;
    if (number) {
        return `\n\nHuman: Act as an expert Nigerian lotto bookmaker. A user wants to know about their lucky number: ${number}.
            Analyze the historical data for the "${game}" lotto, ${analysisPeriod}.
            Provide a detailed "Bookmaker's Insight" on this number. Your analysis must include:
            1. Status: Is the number "Hot", "Cold", or "Overdue"?
            2. Frequency: How many times has it appeared?
            
            Return ONLY a valid JSON object matching this structure: { "analysis": "...", "status": "...", "frequency": ... }
            \n\nAssistant:`;
    }
    return `\n\nHuman: Act as an expert Nigerian lotto bookmaker. Analyze the historical data for the "${game}" lotto, ${analysisPeriod}.
        Your analysis should consider Hot, Cold, and Overdue numbers.
        Provide the top 5 most likely numbers and a "Bookmaker's Insight" explaining your reasoning.
        
        Return ONLY a valid JSON object matching this structure: { "predictions": [{ "number": ..., "probability": ... }], "analysis": "..." }
        \n\nAssistant:`;
};


exports.handler = async (event) => {
    try {
        const path = event.path;
        const body = JSON.parse(event.body);
        const { game, mode, year, number } = body;

        const prompt = generatePrompt(game, mode, year, number);
        
        const bedrockRequest = {
            modelId,
            contentType: "application/json",
            accept: "application/json",
            body: JSON.stringify({
                anthropic_version: "bedrock-2023-05-31",
                max_tokens: 2000,
                messages: [{ "role": "user", "content": prompt }]
            })
        };

        const command = new InvokeModelCommand(bedrockRequest);
        const apiResponse = await client.send(command);
        const decodedBody = new TextDecoder().decode(apiResponse.body);
        const responseBody = JSON.parse(decodedBody);
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
            body: JSON.stringify({ message: "Failed to get a response from the Oracle." }),
        };
    }
};
```

---

### Step 5: Securely Configure the Lambda Function

We need to give our Lambda function the necessary permissions and secrets.

1.  **Set Environment Variable (Gemini Only):** If you chose Gemini, you must securely store your API key.
    ```bash
    amplify update function
    ```
    -   **Select which capability you want to update:** `Environment variables`
    -   **Enter the environment variable name:** `GEMINI_API_KEY`
    -   **Enter the environment variable value:** `Paste your_actual_gemini_api_key_here`
    -   **Do you want to add another environment variable?** `No`

2.  **Add Permissions (Bedrock Only):** If you chose Bedrock, the Lambda function needs permission to call the Bedrock service.
    ```bash
    amplify update function
    ```
    -   **Select which capability you want to update:** `Resource access permissions`
    -   **Select the category:** `predictions`
    -   **Select the resource:** `bedrock`
    -   **Select the operations you want to permit:** `InvokeModel`

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

When you create an account and click "Get Lucky Numbers", you will be making a live, secure call to your AWS Lambda function, which will then call the AI service and return a real prediction.

**Congratulations! You have a fully deployed, secure, and scalable AI application.**