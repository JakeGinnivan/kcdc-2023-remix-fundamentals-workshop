import type { Session } from "@prisma/client";

export function getTimeSlots<T extends Pick<Session, "startsAt" | "endsAt">>(
  sessions: T[]
) {
  return sessions
    .reduce<Array<{ startsAt: string; endsAt: string; sessions: T[] }>>(
      (acc, session) => {
        const startsAt = formatTime(session.startsAt);
        const endsAt = formatTime(session.endsAt);

        const existingItem = acc.find((item) => item.startsAt === startsAt);

        if (!existingItem) {
          const newItem = {
            startsAt,
            endsAt,
            sessions: [session],
          };
          acc.push(newItem);
        } else {
          existingItem.sessions.push(session);

          // Update the endsAt time if it's shorter than the current session's endsAt time
          if (
            toMinutes(endsAt) < toMinutes(existingItem.endsAt) &&
            endsAt !== existingItem.endsAt
          ) {
            existingItem.endsAt = endsAt;
          }
        }

        return acc;
      },
      []
    )
    .sort((a, b) => {
      return toMinutes(a.startsAt) - toMinutes(b.startsAt);
    });
}

function toMinutes(timeString: string) {
  const [hours, minutes] = timeString.split(":");
  const timeInMinutes = parseInt(hours, 10) * 60 + parseInt(minutes, 10);

  return timeInMinutes;
}

function formatTime(timeString: string) {
  const [hours, minutes] = timeString.split(":");
  const formattedTime = `${parseInt(hours, 10)}:${minutes}`;

  return formattedTime;
}

export function calculateSlotSpan<
  T extends Pick<Session, "startsAt" | "endsAt" | "roomId">
>(
  session: T,
  slots: Array<{ startsAt: string; endsAt: string; sessions: T[] }>
) {
  const startsAt = formatTime(session.startsAt);
  const endsAt = formatTime(session.endsAt);

  // Count the number of slots this session spans in the same room
  const slotSpan = slots.reduce((acc, slot) => {
    if (
      toMinutes(startsAt) >= toMinutes(slot.startsAt) &&
      toMinutes(endsAt) <= toMinutes(slot.endsAt) &&
      slot.sessions.some((slotSession) => slotSession.roomId === session.roomId)
    ) {
      acc++;
    }

    return acc;
  }, 0);

  return slotSpan;
}

export function roomHasSpanningSession<
  T extends Pick<Session, "startsAt" | "endsAt" | "roomId">
>(
  roomId: number,
  currentSlot: { startsAt: string; endsAt: string; sessions: T[] },
  slots: Array<{ startsAt: string; endsAt: string; sessions: T[] }>
) {
  const earlierSlots = slots.filter((slot) => {
    return toMinutes(slot.startsAt) < toMinutes(currentSlot.startsAt);
  });

  // Return true if earlier slots have a session that spans the same time as this session
  return earlierSlots.some((slot) => {
    const sessionInRoom = slot.sessions.find(
      (slotSession) => slotSession.roomId === roomId
    );

    // Check if the session in the room spans the same time as this session
    return (
      sessionInRoom &&
      toMinutes(sessionInRoom.endsAt) > toMinutes(currentSlot.startsAt)
    );
  });
}
