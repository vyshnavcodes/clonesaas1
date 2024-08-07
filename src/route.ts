import { NextResponse } from "next/server";
import OpenAI from "openai";

// Define TypeScript interface for user sign-up data
interface UserSignUp {
  email: string; // The user's email address for signup
  password: string; // The user's chosen password for their account
  confirmPassword: string; // Confirmation of the user's password
}

// Define TypeScript interface for the API key generation request
interface APIKeyGeneration {
  userId: string; // Unique identifier for the user requesting the API key
}

// Define TypeScript interface for AI customization options
interface CustomizationOptions {
  tone: 'formal' | 'informal' | 'friendly' | 'professional'; // The desired tone of the AI-generated response
  language: string; // The language for the AI-generated response
}

// Define TypeScript interface for usage tracking
interface UsageTracking {
  userId: string; // Unique identifier for the user
  creditsUsed: number; // The number of credits used in generating responses
  totalCredits: number; // The total credits available for the user
}

// Define TypeScript interface for responses
interface SignUpResponse {
  success: boolean; // Indicates if the sign-up was successful
  userId?: string; // The unique identifier for the new user (optional in case of failure)
  message?: string; // Any relevant message or error details
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Use environment variable for sensitive information
});

// Function to generate AI response using OpenAI API
async function generateAIResponse(content: string, options: CustomizationOptions): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Generate an AI response with the following content:
          
          Content: ${content}
          Tone: ${options.tone}
          Language: ${options.language}`,
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "generate_response",
            description: "Generate an AI-powered response based on the provided content",
            parameters: {
              type: "object",
              properties: {
                response: {
                  type: "string",
                  description: "The AI-generated response",
                },
              },
              required: ["response"],
            },
          },
        },
      ],
      tool_choice: "auto",
    });

    const toolCalls = response.choices[0].message.tool_calls;
    if (toolCalls && toolCalls[0].function.name === "generate_response") {
      const generatedContent = JSON.parse(toolCalls[0].function.arguments);
      return generatedContent.response;
    }

    throw new Error("Unexpected response from OpenAI");
  } catch (error) {
    throw new Error(`Error generating response: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Main POST function for handling requests
export async function POST(req: Request) {
  try {
    // Parse the incoming JSON request
    const data: { content: string; options: CustomizationOptions } = await req.json();

    // Generate AI response based on user content and customization options
    const response = await generateAIResponse(data.content, data.options);

    // Return the AI generated response
    return NextResponse.json({ success: true, response }, { status: 200 });
  } catch (error) {
    // Handle any unexpected errors with proper status code and message
    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate response.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}