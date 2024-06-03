addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
  });
  
  async function handleRequest(request) {
    if (request.method === 'POST') {
      return await handleImageUpload(request);
    } else {
      return new Response('Only POST requests are accepted', { status: 405 });
    }
  }
  
  async function handleImageUpload(request) {
    const formData = await request.formData();
    const file = formData.get('file');
  
    if (!file || !file.name) {
      return new Response('No file uploaded', { status: 400 });
    }
  
    // Generate a unique name for the file
    const fileName = `${Date.now()}-${file.name}`;
    
    // Upload the file to Cloudflare R2
    const bucketName = 'YOUR_BUCKET_NAME';
    const r2Response = await fetch(`https://${bucketName}.r2.cloudflarestorage.com/${fileName}`, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file.stream(),
    });
  
    if (!r2Response.ok) {
      return new Response('Failed to upload file', { status: 500 });
    }
  
    const fileUrl = `https://${bucketName}.r2.cloudflarestorage.com/${fileName}`;
  
    // Return the URL for embedding
    return new Response(JSON.stringify({ url: fileUrl }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
  