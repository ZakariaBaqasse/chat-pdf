export async function POST(request: Request, response: Response) {
  try {
    const body = await request.json();
    const { fileName, fileKey } = body;
    return Response.json(
      { message: "Chat created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("error in /api/create-chat", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
