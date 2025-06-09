import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import katex from 'katex'; // Import KaTeX
import 'katex/dist/katex.min.css'; // Import KaTeX CSS
import './Conversation.css'

// --- KaTeX Rendering Component ---
const MessageContent = ({ content }) => {
  if (typeof content !== 'string') {
    return <>{content}</>;
  }
  const elements = [];
  const regex = /(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      elements.push(<span key={`text-${lastIndex}`}>{content.substring(lastIndex, match.index)}</span>);
    }
    const matchedPart = match[0];
    let latexToRender = '';
    let isDisplayMode = false;
    if (matchedPart.startsWith('$$') && matchedPart.endsWith('$$')) {
      latexToRender = matchedPart.substring(2, matchedPart.length - 2);
      isDisplayMode = true;
    } else if (matchedPart.startsWith('$') && matchedPart.endsWith('$')) {
      latexToRender = matchedPart.substring(1, matchedPart.length - 1);
      isDisplayMode = false;
    }
    if (latexToRender.trim() !== "") {
      try {
        const html = katex.renderToString(latexToRender, {
          displayMode: isDisplayMode,
          throwOnError: false,
          output: "html",
        });
        elements.push(<span key={`katex-${match.index}`} dangerouslySetInnerHTML={{ __html: html }} />);
      } catch (e) {
        console.error('KaTeX rendering error for:', latexToRender, e);
        elements.push(<span key={`error-${match.index}`}>{matchedPart}</span>);
      }
    } else {
      elements.push(<span key={`empty-${match.index}`}>{matchedPart}</span>);
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < content.length) {
    elements.push(<span key={`text-${lastIndex}`}>{content.substring(lastIndex)}</span>);
  }
  return <>{elements}</>;
};

// --- System Prompt for Gemini AI Agent ---
const GEMINI_SYSTEM_PROMPT = `You are a specialized Physics AI Agent. Your primary purposes are:
1. To assist users by solving physics problems, explaining concepts, and engaging in discussions about physics.
2. To help users visualize physics scenes by discussing how the described scenario can be translated into a specific JSON format suitable for a 3D visualizer.

Interaction Flow:
- First, focus on the physics problem or discussion at hand. Provide clear explanations and solutions.
- After addressing the physics query, if the conversation describes a physical scene, you should then discuss how this scene could be represented in the JSON format outlined below. Explain the mapping of objects, properties, and interactions to the JSON structure.
- IMPORTANT: Only generate the actual JSON output if the user explicitly asks to "visualize," "generate JSON," "show me the JSON," or a similar direct command. When generating JSON, it must be the ONLY content in your response, with no preceding or succeeding text or markdown. Otherwise, stick to discussing the conversion process and the relevant JSON fields.

Greeting:
When starting a new conversation (implicitly, as this is a system prompt guiding your first response if it's a greeting), please greet the user by introducing yourself and your dual purpose. For example: "Hello! I'm a Physics AI Agent. I can help you with physics questions and also discuss how to represent described scenes in a 3D visualizer JSON format. How can I assist you with physics today?"

JSON Generation Guidelines for 3D Visualization:

When asked to generate JSON for a scene:

1.  **Crucial Positioning and Sizing Guidelines:**
    * **Avoid Initial Overlap:** When determining the "position" of each object, meticulously consider its "radius" (for Spheres and Cylinders) or "dimensions" (for Boxes) in conjunction with the positions and sizes of other objects. The goal is to ensure no objects are intersecting or overlapping in their initial state unless explicitly described as such (e.g., an object embedded in another).
    * **Relative Placement Logic:**
        * **Direct Stacking:** If the conversation implies objects are **stacked directly on top of one another** (e.g., "a box on top of another box," "a tower of three cubes," "cube A supports cube B"), their initial positions MUST reflect this. The bottom surface of an upper object should precisely contact (or be a negligible, visually imperceptible distance above) the top surface of the lower object. Calculate positions based on their full dimensions/radii to achieve this precise initial contact.
        * **General Vertical Arrangement (to fall and stack):** If objects are described more generally as "above" each other or intended to fall and then stack (e.g., "three boxes arranged vertically, starting separated"), then initial vertical separation is appropriate.
        * **On Surfaces:** For objects **resting on a platform or ground**, ensure their lowest point is at or slightly above the supporting surface's top. Calculate this based on the object's dimensions and the platform's position and dimensions.
        * **Adjacent Objects:** For objects described as "next to each other" or "side-by-side," position them so their bounding boxes are adjacent without overlap, unless direct contact is specified. Introduce a small default gap if no explicit contact is mentioned.
    * **Ground Plane Consideration:** If a ground or platform is defined, ensure other dynamic objects are positioned above it and not intersecting it, unless the description specifies embedding.

2.  **Strict JSON Output Format:**
    * Return the JSON object **alone**, without any additional text, comments, or Markdown (e.g., no \`\`\`json ... \`\`\` markers, no explanations before or after). The response must be parseable directly as JSON by a program. Do not wrap it in code blocks or add formatting.

3.  **Field Definitions:**

    * **Required fields by type:**
        * \`Sphere\`: \`id\` (string, unique), \`type\` (string, "Sphere"), \`mass\` (number), \`radius\` (number), \`position\` (array of 3 numbers [x,y,z])
        * \`Box\`: \`id\` (string, unique), \`type\` (string, "Box"), \`mass\` (number), \`dimensions\` (array of 3 numbers [width, height, depth]), \`position\` (array of 3 numbers [x,y,z])
        * \`Cylinder\`: \`id\` (string, unique), \`type\` (string, "Cylinder"), \`mass\` (number), \`radius\` (number), \`height\` (number), \`position\` (array of 3 numbers [x,y,z])

    * **Optional fields for all object types** (if omitted, values from scene 'contactMaterial' are used for friction/restitution, or engine defaults for others):
        * \`velocity\`: array of 3 numbers (default [0, 0, 0])
        * \`rotation\`: array of 3 numbers representing Euler angles in radians (default [0, 0, 0])
        * \`color\`: string (hex e.g., "#FF0000" or CSS color name e.g., "red", default "#ff6347" or a varied color if multiple objects)
        * \`restitution\`: number (range 0 to 1; overrides scene 'contactMaterial.restitution')
        * \`friction\`: number (range 0 to 1+; overrides scene 'contactMaterial.friction')

    * **Scene-level fields:**
        * \`id\`: string, unique (default to a timestamp-like string if missing, e.g., "scene_YYYYMMDDHHMMSS" or a UUID)
        * \`name\`: string, based on scene name (default "Extracted Scene from Conversation")
        * \`description\`: string, based on scene details (default "Scene described in the conversation")
        * \`objects\`: array of object definitions (empty array \`[]\` if none found)
        * \`gravity\`: array of 3 numbers (default [0, -9.81, 0])
        * \`contactMaterial\`: object that **must be present** and defines default physical properties for contacts in the scene.
            * \`friction\`: number (default 0.5)
            * \`restitution\`: number (default 0.7)

4.  **Example of Full JSON Output:**
    \`\`\`json
    {"id":"example","name":"Bouncing Ball and Ramp","description":"A ball bounces on a sloped platform","objects":[{"id":"ball-1","type":"Sphere","mass":2,"radius":0.5,"position":[0,5,0],"velocity":[0,0,0],"rotation":[0,0,0],"color":"#ff6347","restitution":0.7,"friction":0.4},{"id":"ramp-1","type":"Box","mass":0,"dimensions":[5,0.2,5],"position":[0,0,0],"rotation":[0.52359877559,0,0],"color":"#88aa88","restitution":0.3,"friction":0.6},{"id":"cyl-1","type":"Cylinder","mass":1,"radius":0.3,"height":1.5,"position":[2,3,0],"velocity":[0,0,0],"rotation":[0,0,0],"color":"#4682b4","restitution":0.5,"friction":0.5}],"gravity":[0,-9.81,0],"contactMaterial":{"friction":0.5,"restitution":0.7}}
    \`\`\`

5.  **No Scene Identifiable:**
    If no physics scene is identifiable in the user's query or the ongoing conversation when asked to visualize, return this exact JSON object:
    \`\`\`json
    {"id":"empty","name":"No Scene Found","description":"No physics scene in conversation","objects":[],"gravity":[0,-9.81,0],"contactMaterial":{"friction":0.5,"restitution":0.7}}
    \`\`\`
`;

// --- Original Conversation Component (Modified) ---
function Conversation({
  updateConversation,
  conversationHistory = [],
  initialMessage = "Hello! I'm a Physics AI Agent. I can help you with physics questions and also discuss how to represent described scenes in a 3D visualizer JSON format. How can I assist you with physics today?"
}) {
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gemini");

  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!hasInitialized.current && conversationHistory.length === 0) {
      // If Gemini is the selected model, its first actual response will be guided by the system prompt's greeting instruction.
      // This initialMessage prop sets the very first visible message before any AI interaction.
      updateConversation([{ role: 'ai', content: initialMessage }]);
      hasInitialized.current = true;
    }
  }, [initialMessage, updateConversation, conversationHistory.length, selectedModel]);

  const maxContextLength = 10; // Defines how many *turns* (user + AI message = 1 turn, conceptually) from history are sent.
                               // So, maxContextLength messages.

  const handleProcess = async (e) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput) {
      alert("Please enter a question.");
      return;
    }

    const userMessage = { role: 'user', content: trimmedInput };
    updateConversation(prev => [...prev, userMessage]);
    setInput("");
    setIsProcessing(true);

    let aiResponse = "I couldn't process that.";
    try {
      // conversationHistory prop is history *before* the current userMessage.
      // historyForAPI includes the current userMessage for the API call.
      const historyForAPI = [...conversationHistory.slice(-(maxContextLength -1)), userMessage];

      if (selectedModel === "chatgpt") {
        // ... (ChatGPT handling remains unchanged)
        console.log("🔁 Trying ChatGPT via Puppeteer...");
        const response = await fetch('http://localhost:3000/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: trimmedInput }),
        });
        if (!response.ok) {
          const errorText = await response.text();
          console.error("ChatGPT Error:", errorText);
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        aiResponse = data.response || aiResponse;
      } else if (selectedModel === "ollama") {
        // ... (Ollama handling remains unchanged)
        const models = ['gemma3', 'gemma3:1b'];
        let success = false;
        for (const model of models) {
          try {
            console.log(`🔁 Trying Ollama model: ${model}`);
            const response = await fetch('http://localhost:11434/api/generate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ model, prompt: trimmedInput, stream: false }),
            });
            if (!response.ok) {
              const errorText = await response.text();
              console.error("Ollama Error:", errorText);
              throw new Error(`Ollama HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            console.log("Ollama Response:", JSON.stringify(data, null, 2));
            aiResponse = data.response || aiResponse;
            success = true;
            break;
          } catch (error) {
            console.warn(`❌ Failed with Ollama ${model}: ${error.message}`);
          }
        }
        if (!success) throw new Error("All Ollama models failed.");
      } else if (selectedModel === "gemini") {
        if (!GEMINI_API_KEY) {
          aiResponse = "Gemini API key is missing. Please configure it.";
        } else {
          console.log("🔁 Trying Gemini API with context and system prompt...");
          const geminiContents = historyForAPI.map(msg => ({
            role: msg.role === 'ai' ? 'model' : 'user',
            parts: [{ text: msg.content }],
          }));

          const requestBody = {
            contents: geminiContents,
            systemInstruction: {
              parts: [{ text: GEMINI_SYSTEM_PROMPT }]
            },
            // Optional: Add generationConfig if needed
            // generationConfig: {
            //   temperature: 0.7,
            //   // responseMimeType: "application/json", // If you ONLY want JSON and can guarantee the prompt will lead to it.
            // },
          };

          // console.log("Gemini Request Body:", JSON.stringify(requestBody, null, 2));

          // gemini-2.5-flash-preview-05-20
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(requestBody),
            }
          );
          if (!response.ok) {
            const errorText = await response.text();
            console.error("Gemini API Error response text:", errorText); // Log the full error
            let errorJson = {};
            try { errorJson = JSON.parse(errorText); } catch (e) { /* ignore parsing error */ }
            const detail = errorJson.error?.message || errorText;
            throw new Error(`Gemini HTTP error! Status: ${response.status} - ${detail}`);
          }
          const data = await response.json();
          // console.log("Gemini API Response:", JSON.stringify(data, null, 2));

          if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
            aiResponse = data.candidates[0].content.parts[0].text;
          } else if (data.promptFeedback?.blockReason) {
            aiResponse = `Blocked by API: ${data.promptFeedback.blockReason}. ${data.promptFeedback.blockReasonMessage || ''}`;
            if (data.candidates?.[0]?.finishReason === "SAFETY") {
                 aiResponse += " (Safety block on response candidate)";
            }
            console.warn("Gemini content issue:", data.promptFeedback, data.candidates?.[0]);
          } else {
            aiResponse = "Gemini returned an empty or unexpected response structure.";
            console.warn("Unexpected Gemini response structure:", data);
          }
        }
      }
      updateConversation(prev => [...prev, { role: 'ai', content: aiResponse }]);
    } catch (error) {
      console.error(`❌ Model failed: ${error.message}`);
      updateConversation(prev => [...prev, {
        role: 'ai',
        content: `Error: Model failed. ${error.message}. Ensure setup is correct.`,
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const displayConversation = conversationHistory
    .slice(-maxContextLength * 2)
    .map((msg, index) => (
      <div key={index} className={msg.role === 'ai' ? 'ai-message' : 'user-message'}>
        <strong>{msg.role === 'ai' ? 'AI:' : 'You:'}</strong>
        {' '}
        <MessageContent content={msg.content} />
      </div>
    ));

  return (
    <div className="conversation-container">
      <div className="conversation-header">
        <label htmlFor="model-select">Model:</label>
        <select
          id="model-select"
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          disabled={isProcessing}
          className="model-selector"
        >
          <option value="gemini">Gemini</option>
          <option value="chatgpt">ChatGPT</option>
          <option value="ollama">Ollama</option>
        </select>
      </div>
      
      <div className="conversation-box">
        {displayConversation}
      </div>
      
      <div className="input-section">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter your physics question..."
          disabled={isProcessing}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleProcess(e);
            }
          }}
          className="input-textarea"
        />
        <button
          onClick={handleProcess}
          disabled={isProcessing || !input.trim()}
          className="process-button"
          title={isProcessing ? "Processing..." : "Send message"}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}

export default Conversation;