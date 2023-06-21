import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Paragraph } from "~/components/Paragraph";
import { Modal } from "~/components/modal";
import { prisma } from "~/db.server";

export async function loader({ params: { day, sessionId } }: LoaderArgs) {
  if (!sessionId) {
    throw new Error("No talk ID provided");
  }
  if (!day) {
    throw new Error("No day provided");
  }

  const session = await prisma.session.findUniqueOrThrow({
    where: {
      id: sessionId,
    },
    select: {
      title: true,
      description: true,
      startsAt: true,
      endsAt: true,
      level: {
        select: {
          name: true,
        },
      },
      speakers: {
        select: {
          id: true,
          fullName: true,
        },
      },
      track: {
        select: {
          name: true,
        },
      },
      room: {
        select: {
          name: true,
        },
      },
    },
  });

  return json({ day, session });
}

export default function TalkDetails() {
  const { day, session } = useLoaderData<typeof loader>();

  return (
    <Modal
      header={
        <div>
          <h3 className="text-xl font-semibold text-gray-900 w-full">
            {session.title}
          </h3>
          <div>
            {session.speakers.map((speaker) => (
              <Link
                to={`/agenda/${day}/speaker/${speaker.id}`}
                className="text-gray-800 block"
                key={speaker.id}
              >
                {speaker.fullName}
              </Link>
            ))}
          </div>
        </div>
      }
      closeLink={`/agenda/${day}`}
    >
      <Paragraph>{session.description}</Paragraph>
    </Modal>
  );
}
