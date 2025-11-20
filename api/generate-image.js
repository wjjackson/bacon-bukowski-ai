const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Prompt required" });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "OpenAI API key not configured" });
  }

  try {
    const openaiRes = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        prompt,
        n: 1,
        size: "1920x1080"
      })
    });

    const openaiData = await openaiRes.json();
    console.log("OpenAI full response:", JSON.stringify(openaiData, null, 2));

    const url = openaiData?.data?.[0]?.url;
    if (!url) throw new Error("No image URL returned");

    res.status(200).json({ url });
  } catch (error) {
    console.error("OpenAI image error:", error);
    res.status(500).json({ error: error?.message || "Image generation failed" });
  }
};
