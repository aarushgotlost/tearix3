export const AI_API_KEY = 'AIzaSyBCmFEsEAtNrUK82-wQ46n1WPngOSGJTus';
export const AI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-002:generateContent';

export interface AIRequest {
  contents: {
    parts: { text: string }[];
  }[];
}

export interface AIResponse {
  candidates: {
    content: {
      parts: { text: string }[];
    };
  }[];
}

export const generateContent = async (prompt: string): Promise<string> => {
  const requestBody: AIRequest = {
    contents: [{
      parts: [{ text: prompt }]
    }]
  };

  const response = await fetch(`${AI_API_URL}?key=${AI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`AI API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
  }

  const data: AIResponse = await response.json();
  
  if (!data.candidates || data.candidates.length === 0) {
    throw new Error('No response generated from AI API');
  }
  
  return data.candidates[0]?.content?.parts[0]?.text || '';
};