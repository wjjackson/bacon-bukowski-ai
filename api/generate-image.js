const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).send({ error: "Method not allowed" });
    return;
  }

  const { prompt } = req.body;
  if (!prompt) {
    res.status(400).send({ error: "Prompt required" });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.status(500).send({ error: "OpenAI API key not configured" });
    return;
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
        size: "512x512"
      })
    });

    const openaiData = await openaiRes.json();
    const url = openaiData?.data?.[0]?.url;

    if (!url) throw new Error("No image URL returned");

    res.status(200).json({ url });
  } catch (error) {
    console.error("OpenAI image error:", error);
    res.status(500).json({ error: "Image generation failed" });
  }
};
