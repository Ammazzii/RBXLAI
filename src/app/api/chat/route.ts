import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { checkAndConsumePrompt, trackUsageAndDeductCredits, getUserPromptStats } from '@/lib/usage-tracking';
import { ApiCallType } from '@prisma/client';

const anthropic = new Anthropic();

// The system prompt is correct and does not need to change.
const systemPromptTemplate = `You are RBXAI, an expert Roblox game development assistant. You MUST follow all rules perfectly.

**CRITICAL: WHEN TO USE TOOL_CODE - READ CAREFULLY:**

**ALWAYS USE TOOL_CODE FOR THESE:**
- "create/make/build a script" → action: "create"
- "update/change/modify/add [feature] to script" → action: "update"
- "add [mobile/console] support" → action: "update"
- "fix the script" → action: "update"
- "delete/remove script" → action: "delete"

**NEVER USE TOOL_CODE FOR THESE:**
- "do you see my changes?" → just respond conversationally
- "what change did I make?" → just respond conversationally
- "can you see that?" → just respond conversationally

**IF USER SAYS SCRIPT WASN'T UPDATED:** Always generate tool_code to fix it

**DUAL RESPONSE REQUIREMENT:**
When your task involves creating, updating, or deleting code, your response MUST contain TWO things:
1.  **A Conversational Response:** A friendly message to the user that INCLUDES the full Lua code inside a normal markdown block (\`\`\`lua ... \`\`\`).
2.  **A Machine Tool:** A SINGLE \`tool_code\` block containing a 100% syntactically valid JSON object for the machine to execute.

**CRITICAL JSON RULE for the 'content' field:**
The value of the "content" field in the JSON MUST be a single-line string. You MUST escape all special characters to make it valid:
- EVERY newline MUST be escaped as \\n.
- EVERY double quote (") MUST be escaped as \\".

**EXAMPLE FOR CREATING A NEW SCRIPT:**

User: "make a sprint script for pc"

Your Perfect Response:
I'll create a sprint script for PC! Here it is:

\`\`\`lua
-- Sprint Script
local player = game.Players.LocalPlayer
local character = player.Character or player.CharacterAdded:Wait()
local humanoid = character:WaitForChild("Humanoid")

local sprintSpeed = 1.5

local function startSprinting()
    humanoid.WalkSpeed = humanoid.WalkSpeed * sprintSpeed
end

local function stopSprinting()
    humanoid.WalkSpeed = humanoid.WalkSpeed / sprintSpeed
end

player:GetMouse().KeyDown:Connect(function(key)
    if key == "LeftShift" then
        startSprinting()
    end
end)

player:GetMouse().KeyUp:Connect(function(key)
    if key == "LeftShift" then
        stopSprinting()
    end
end)
\`\`\`

\`\`\`tool_code
{
  "action": "create",
  "path": "StarterPlayer/StarterPlayerScripts/SprintScript",
  "type": "LocalScript",
  "content": "-- Sprint Script\\nlocal player = game.Players.LocalPlayer\\nlocal character = player.Character or player.CharacterAdded:Wait()\\nlocal humanoid = character:WaitForChild(\\"Humanoid\\")\\n\\nlocal sprintSpeed = 1.5\\n\\nlocal function startSprinting()\\n    humanoid.WalkSpeed = humanoid.WalkSpeed * sprintSpeed\\nend\\n\\nlocal function stopSprinting()\\n    humanoid.WalkSpeed = humanoid.WalkSpeed / sprintSpeed\\nend\\n\\nplayer:GetMouse().KeyDown:Connect(function(key)\\n    if key == \\"LeftShift\\" then\\n        startSprinting()\\n    end\\nend)\\n\\nplayer:GetMouse().KeyUp:Connect(function(key)\\n    if key == \\"LeftShift\\" then\\n        stopSprinting()\\n    end\\nend)"
}
\`\`\`

**EXAMPLE FOR UPDATING AN EXISTING SCRIPT:**

User: "Update my sprint script to add console support"

Your Perfect Response:
I'll update your sprint script to add console support! Here's the enhanced version:

\`\`\`lua
-- Sprint Script with Console Support
local player = game.Players.LocalPlayer
local character = player.Character or player.CharacterAdded:Wait()
local humanoid = character:WaitForChild("Humanoid")

local sprintSpeed = 20

local function startSprinting()
    humanoid.WalkSpeed = humanoid.WalkSpeed * sprintSpeed
end

local function stopSprinting()
    humanoid.WalkSpeed = humanoid.WalkSpeed / sprintSpeed
end

-- Keyboard control
player:GetMouse().KeyDown:Connect(function(key)
    if key == "LeftShift" then
        startSprinting()
    end
end)

-- Console support
local UserInputService = game:GetService("UserInputService")
UserInputService.InputBegan:Connect(function(input)
    if input.KeyCode == Enum.KeyCode.ButtonR3 then
        startSprinting()
    end
end)
\`\`\`

\`\`\`tool_code
{
  "action": "update",
  "path": "StarterPlayer/StarterPlayerScripts/SprintScript",
  "content": "-- Sprint Script with Console Support\\nlocal player = game.Players.LocalPlayer\\nlocal character = player.Character or player.CharacterAdded:Wait()\\nlocal humanoid = character:WaitForChild(\\"Humanoid\\")\\n\\nlocal sprintSpeed = 20\\n\\nlocal function startSprinting()\\n    humanoid.WalkSpeed = humanoid.WalkSpeed * sprintSpeed\\nend\\n\\nlocal function stopSprinting()\\n    humanoid.WalkSpeed = humanoid.WalkSpeed / sprintSpeed\\nend\\n\\n-- Keyboard control\\nplayer:GetMouse().KeyDown:Connect(function(key)\\n    if key == \\"LeftShift\\" then\\n        startSprinting()\\n    end\\nend)\\n\\n-- Console support\\nlocal UserInputService = game:GetService(\\"UserInputService\\")\\nUserInputService.InputBegan:Connect(function(input)\\n    if input.KeyCode == Enum.KeyCode.ButtonR3 then\\n        startSprinting()\\n    end\\nend)"
}
\`\`\`

**REMEMBER: If user asks to update/change/modify any existing script, you MUST include both the conversational response AND the tool_code block.**

You will be given context about the project structure and active file. Use it to determine the correct paths and actions.`;

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    // Validate environment variables
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY is not configured');
      return NextResponse.json({ error: 'AI service not configured' }, { status: 500 });
    }

    // Check authentication
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check and consume one prompt from daily limit
    const promptResult = await checkAndConsumePrompt(user.id, user.subscriptionTier);
    if (!promptResult.success) {
      return NextResponse.json({
        error: promptResult.error,
        remainingPrompts: promptResult.remainingPrompts || 0,
        subscriptionTier: user.subscriptionTier,
        message: 'Daily prompt limit exceeded. Upgrade your plan for more prompts.'
      }, { status: 402 });
    }

    const { messages, projectTree, activeFile, modifiedFiles } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Valid messages array is required' }, { status: 400 });
    }

    if (messages.length === 0) {
      return NextResponse.json({ error: 'At least one message is required' }, { status: 400 });
    }

    // --- BULLETPROOF CONTEXT WITH ALL LATEST FILE CONTENT ---
    let contextBlock = '<CONTEXT>\n';
    contextBlock += `Project Structure:\n${projectTree || 'No structure provided.'}\n`;

    // Include ALL files with content (this gives AI complete awareness)
    if (modifiedFiles && Array.isArray(modifiedFiles) && modifiedFiles.length > 0) {
        contextBlock += `\n**ALL SCRIPT FILES WITH CURRENT CONTENT:**\n`;
        contextBlock += `These are ALL the script files that currently exist with their LATEST content:\n\n`;

        modifiedFiles.forEach(file => {
            const timeSince = Date.now() - file.lastModified;
            const timeString = timeSince < 60000 ? 'just now' : `${Math.floor(timeSince / 60000)} minutes ago`;
            contextBlock += `📄 **${file.path}** (last modified ${timeString}):\n\`\`\`lua\n${file.content}\n\`\`\`\n\n`;
        });
    }

    // Highlight the currently active file
    if (activeFile && activeFile.path) {
        contextBlock += `\n🎯 **CURRENTLY ACTIVE FILE: ${activeFile.path}**\n`;
        contextBlock += `This is the file the user currently has open and might be referring to:\n\`\`\`lua\n${activeFile.content || '-- This file is empty.'}\n\`\`\`\n`;
    }

    contextBlock += '\n**REMINDERS:**\n';
    contextBlock += '- For creating new scripts: use "action": "create" with path, type, and content\n';
    contextBlock += '- For updating existing scripts: use "action": "update" with path and content\n';
    contextBlock += '- For questions about seeing changes: just respond conversationally\n';
    contextBlock += '</CONTEXT>';

    // We combine the static rules with the dynamic context for this specific request.
    const fullSystemPrompt = systemPromptTemplate + '\n\n' + contextBlock;
    
    const messagesForApi = [...messages];

    const response = await anthropic.messages.create({
      model: 'claude-opus-4-1-20250805',
      max_tokens: 7777,
      system: fullSystemPrompt, // Use the combined system prompt
      messages: messagesForApi,
    });

    const firstBlock = response.content[0];
    if (!firstBlock || firstBlock.type !== 'text') {
        throw new Error('Invalid response from AI.');
    }
    
    const aiReply = firstBlock.text;

    // Calculate usage metrics
    const responseTime = Date.now() - startTime;
    const inputTokens = response.usage?.input_tokens || 0;
    const outputTokens = response.usage?.output_tokens || 0;
    const totalTokens = inputTokens + outputTokens;

    // Track usage for analytics
    const trackingResult = await trackUsageAndDeductCredits({
      userId: user.id,
      apiCallType: ApiCallType.CHAT_COMPLETION,
      tokensUsed: totalTokens,
      requestDetails: {
        inputTokens,
        outputTokens,
        model: 'claude-opus-4-1-20250805',
        projectTree: !!projectTree,
        activeFile: !!activeFile,
        modifiedFilesCount: modifiedFiles?.length || 0
      },
      responseTime
    });

    if (!trackingResult.success) {
      console.error('Usage tracking failed:', trackingResult.error);
      // Continue anyway, don't fail the request
    }

    // Get updated prompt stats
    const promptStats = await getUserPromptStats(user.id);

    return NextResponse.json({
      reply: aiReply,
      usage: {
        tokensUsed: totalTokens,
        inputTokens,
        outputTokens,
        promptsUsed: 1,
        remainingPrompts: promptResult.remainingPrompts || 0,
        dailyLimit: promptStats?.dailyLimit || 10,
        subscriptionTier: user.subscriptionTier,
        responseTime
      }
    });

  } catch (error) {
    console.error('Error calling Anthropic API:', error);

    // Handle different types of errors
    if (error instanceof Error) {
      if (error.message.includes('401') || error.message.includes('unauthorized')) {
        return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
      }
      if (error.message.includes('429') || error.message.includes('rate limit')) {
        return NextResponse.json({ error: 'Rate limit exceeded. Please try again later.' }, { status: 429 });
      }
      if (error.message.includes('network') || error.message.includes('ENOTFOUND')) {
        return NextResponse.json({ error: 'Network error. Please check your connection.' }, { status: 503 });
      }
      return NextResponse.json({ error: `AI service error: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}