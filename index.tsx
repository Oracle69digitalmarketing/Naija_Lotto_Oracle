import React from "react";
import { createRoot } from "react-dom/client";
import { Amplify } from "aws-amplify";
import { Authenticator } from "@aws-amplify/ui-react";
import App from "./App";
import awsmobile from "./aws-exports";

Amplify.configure(awsmobile);

const container = document.getElementById("root");
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <Authenticator.Provider>
        <Authenticator>
            <App />
        </Authenticator>
    </Authenticator.Provider>
  </React.StrictMode>
);