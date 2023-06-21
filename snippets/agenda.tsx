import { json, type V2_MetaFunction } from "@remix-run/node";
import { NavLink, Outlet, useLoaderData } from "@remix-run/react";
import type { PropsWithChildren } from "react";
import { prisma } from "~/db.server";

export const meta: V2_MetaFunction = () => [{ title: "KCDC Agenda" }];

export async function loader() {
  console.log(prisma);
  const tracks = await prisma.track.findMany({
    select: {
      id: true,
      name: true,
    },
  });

  return json({ tracks });
}

export default function Agenda() {
  const { tracks } = useLoaderData<typeof loader>();

  return (
    <div>
      <h1 className="text-4xl ml-4">Agenda</h1>

      <h2 className="text-2xl ml-4">Tracks</h2>
      <ul className="flex flex-wrap items-center justify-center">
        {tracks.map((track) => (
          <li
            key={track.id}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 m-1 rounded-full"
          >
            {track.name}
          </li>
        ))}
      </ul>

      <div className="text-sm font-medium text-center text-gray-800 border-b border-gray-200">
        <ul className="flex flex-wrap -mb-px">
          <li className="mr-2">
            <DayTab to="/agenda/1">Day 1</DayTab>
          </li>
          <li className="mr-2">
            <DayTab to="/agenda/2">Day 2</DayTab>
          </li>
          <li className="mr-2">
            <DayTab to="/agenda/3">Day 3</DayTab>
          </li>
        </ul>
      </div>

      <Outlet />
    </div>
  );
}

function DayTab({ to, children }: PropsWithChildren<{ to: string }>) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:border-gray-300${
          isActive
            ? " active text-blue-700 border-blue-900"
            : " hover:text-gray-600 "
        }`
      }
    >
      {children}
    </NavLink>
  );
}
