import { json, redirect, type LoaderArgs } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import type { ReactNode } from "react";
import { prisma } from "~/db.server";
import {
  calculateSlotSpan,
  getTimeSlots,
  roomHasSpanningSession,
} from "../utils/timeslot-utils";

export async function loader({ params: { day }, request }: LoaderArgs) {
  const dayNumber = Number(day);
  if (!day) {
    throw redirect(`${request.url}/1`);
  }

  const sessions = await prisma.session.findMany({
    where: {
      day: dayNumber,
    },
    select: {
      id: true,
      title: true,
      startsAt: true,
      endsAt: true,
      roomId: true,
      track: {
        select: {
          id: true,
          name: true,
        },
      },
      speakers: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
    orderBy: {
      startsAt: "asc",
    },
  });

  const rooms = await prisma.room.findMany({});
  const timeSlots = getTimeSlots(sessions);

  return json({ day, rooms, timeSlots });
}

export default function Day() {
  const { day, rooms, timeSlots } = useLoaderData<typeof loader>();

  return (
    <div>
      <h2 className="text-2xl my-6">Day {day} Sessions</h2>
      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th></th>
              {rooms.map((room) => (
                <th
                  key={room.id}
                  scope="col"
                  className="px-6 py-3 whitespace-nowrap min-w-[200px]"
                >
                  {room.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((timeSlot) => (
              <tr className="bg-white border-b" key={timeSlot.startsAt}>
                <td className="whitespace-nowrap">
                  {timeSlot.startsAt} - {timeSlot.endsAt}
                </td>
                {rooms.map((room) => {
                  const session = timeSlot.sessions.find(
                    (session) => session.roomId === room.id
                  );

                  if (roomHasSpanningSession(room.id, timeSlot, timeSlots)) {
                    return null;
                  }

                  return (
                    <td
                      key={room.id}
                      className="px-4 py-2 bg-gray-100 border-2 border-gray-200"
                      rowSpan={
                        session
                          ? calculateSlotSpan(session, timeSlots)
                          : undefined
                      }
                    >
                      {session && (
                        <div key={session.id}>
                          <Link
                            to={`/agenda/${day}/session/${session.id}`}
                            className="text-lg cursor-pointer"
                          >
                            {session.title}
                          </Link>

                          <div>
                            {session.speakers.reduce<ReactNode[]>(
                              (acc, speaker) => {
                                if (acc.length > 0) {
                                  acc.push(", ");
                                }
                                acc.push(
                                  <Link
                                    key={speaker.id}
                                    to={`/agenda/${day}/speaker/${speaker.id}`}
                                    className="text-blue-500"
                                  >
                                    {speaker.fullName}
                                  </Link>
                                );

                                return acc;
                              },
                              []
                            )}
                          </div>

                          {session.track ? (
                            <div className="bg-blue-500 text-white py-1 px-2 m-1 rounded-md whitespace-nowrap w-fit">
                              {session.track.name}
                            </div>
                          ) : null}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Outlet />
    </div>
  );
}
