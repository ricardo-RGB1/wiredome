import { prisma } from "@/lib/db";






/**
 * Gets an existing conversation between two members or creates a new one if none exists
 * 
 * @param memberOneId - The ID of the first member in the conversation
 * @param memberTwoId - The ID of the second member in the conversation
 * @returns Promise that resolves to the conversation between the members
 * 
 * First tries to find an existing conversation between the members.
 * If none exists, creates a new conversation between them.
 * Returns the found or newly created conversation.
 */
export const getOrCreateConversation = async (
  memberOneId: string,
  memberTwoId: string
) => {
  let conversation = await findConversation(memberOneId, memberTwoId);
  
  if (!conversation) {
    conversation = await createConversation(memberOneId, memberTwoId);
  }
  return conversation;
  // example of the return: 
  // {
  //   id: '123',
  //   memberOneId: '456',
  //   memberTwoId: '789',  
  //   memberOne: {
  //     id: '456',
  //     profile: {
  //       id: '101',
  //       name: 'John Doe',
  //       ...
  //     }
  //   },
  //   ...
  // }
};



/**
 * Finds a conversation between two members in the database
 *
 * @param memberOneId - The ID of the first member in the conversation
 * @param memberTwoId - The ID of the second member in the conversation
 * @returns Promise that resolves to the conversation if found, or null if not found
 *
 * The query looks for a conversation where:
 * - memberOneId matches either memberOneId or memberTwoId field
 * - memberTwoId matches the other field
 * - Includes the full profile data for both members
 */
const findConversation = async (memberOneId: string, memberTwoId: string) => {
  try {
    return await prisma.conversation.findFirst({
      where: {
        OR: [ // OR is used to return all conversations that match either of the conditions
          {
            AND: [{ memberOneId: memberOneId }, { memberTwoId: memberTwoId }],
          },
          {
            AND: [{ memberOneId: memberTwoId }, { memberTwoId: memberOneId }],
          },
        ],
      },
      include: {
        memberOne: {
          include: {
            profile: true,
          },
        },
        memberTwo: {
          include: {
            profile: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Failed to find conversation:", error);
    return null;
  }
};

const createConversation = async (memberOneId: string, memberTwoId: string) => {
  try {
    return await prisma.conversation.create({
      data: {
        memberOneId,
        memberTwoId,
      },
      include: {
        memberOne: { include: { profile: true } },
        memberTwo: { include: { profile: true } },
      },
    });
  } catch (error) {
    console.error("Failed to create conversation:", error);
    return null;
  }
};

export { findConversation, createConversation };
