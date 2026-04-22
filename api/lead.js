module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, phone, instagram, utm_source, utm_medium, utm_campaign, utm_content, utm_term } =
    req.body;

  const params = new URLSearchParams({
    client: process.env.LEADIX_CLIENT,
    token: process.env.LEADIX_TOKEN,
  });

  const payload = {
    name,
    phone,
    instagram,
    pipeline: "Consultoria",
    pipelineStage: 1,
    owner: process.env.LEADIX_OWNER,
  };

  if (utm_source) payload.utm_source = utm_source;
  if (utm_medium) payload.utm_medium = utm_medium;
  if (utm_campaign) payload.utm_campaign = utm_campaign;
  if (utm_content) payload.utm_content = utm_content;
  if (utm_term) payload.utm_term = utm_term;

  try {
    const response = await fetch(
      `https://leadix.app/api/1.1/wf/post_lead/?${params}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (data.status === "success") {
      return res.status(200).json({ status: "success" });
    }

    return res.status(500).json({ error: "Leadix error" });
  } catch {
    return res.status(500).json({ error: "Internal error" });
  }
};
