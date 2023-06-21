import type { LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { prisma } from "~/db.server";
import { getUserId } from "~/session.server";

export async function loader({ request }: LoaderArgs) {
  const userId = await getUserId(request);
  if (!userId) {
    throw redirect("/login");
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
    select: {
      mySessions: {
        select: {
          id: true,
          title: true,
          day: true,
          startsAt: true,
          endsAt: true,
          room: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  const sessionsByDay = user.mySessions.reduce((acc, session) => {
    if (!acc[session.day]) {
      acc[session.day] = [];
    }
    acc[session.day].push(session);
    return acc;
  }, {} as Record<number, typeof user.mySessions>);

  return json({ sessionsByDay });
}

export default function MyAgendaAddPage() {
  const { sessionsByDay } = useLoaderData<typeof loader>();

  return (
    <div>
      <h2 className="text-2xl my-6">My Agenda</h2>
      <Link to="/agenda" className="mb-4">
        Back to agenda
      </Link>

      <div className="relative overflow-x-auto">
        {Object.entries(sessionsByDay).map(([day, myAgenda]) => (
          <div key={day}>
            <h3 className="text-xl my-4">Day {day}</h3>
            <ul>
              {myAgenda.map(({ id, title, startsAt, endsAt, room }) => (
                <li key={id}>
                  {startsAt} - {endsAt} {title} ({room.name})
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
