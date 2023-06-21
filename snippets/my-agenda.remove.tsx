import { json, type ActionArgs } from "@remix-run/node";
import { z } from "zod";
import { prisma } from "~/db.server";
import { getUserId } from "~/session.server";

const agendaItem = z.object({
  sessionId: z.string(),
});

export async function action({ request }: ActionArgs) {
  const userId = await getUserId(request);
  if (!userId) {
    throw new Response(null, { status: 401 });
  }

  const body = await request.formData();

  const parsed = agendaItem.safeParse(Object.fromEntries(body));
  if (!parsed.success) {
    throw new Response(JSON.stringify(parsed), { status: 400 });
  }

  const { sessionId } = parsed.data;

  const userAgenda = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      mySessions: {
        disconnect: { id: sessionId },
      },
    },
  });

  if (!userAgenda) {
    throw new Response(null, { status: 404 });
  }
  return json({ success: true });
}
