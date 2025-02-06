import { currentProfile } from "@/lib/current-profile";
import { RedirectToSignIn } from "@clerk/nextjs";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { getOrCreateConversation } from "@/lib/conversation";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ChatInput } from "@/components/chat/chat-input";
import { MediaRoom } from "@/components/media-room";

interface MemberIdPageProps {
  params: {
    serverId: string;
    memberId: string;
  };
  searchParams: {
    video?: boolean;
  };
}

// This page is for the conversation between two members
const MemberIdPage = async ({ params, searchParams }: MemberIdPageProps) => {
  // Get the current profile of the user
  const profile = await currentProfile();
  if (!profile) {
    return <RedirectToSignIn />;
  }

  // Get the current member of the server
  const currentMember = await prisma.member.findFirst({
    where: {
      serverId: params.serverId,
      profileId: profile.id,
    },
    include: {
      profile: true,
    },
  });

  if (!currentMember) {
    return redirect("/");
  }

  // Get or create a conversation between the current member and the target member
  const conversation = await getOrCreateConversation(
    currentMember.id,
    params.memberId
  );

  // If no conversation could be created/found, redirect back to the server page
  if (!conversation) {
    return redirect(`/servers/${params.serverId}`);
  }

  // Destructure the two members involved in the conversation
  const { memberOne, memberTwo } = conversation;

  // Get the other member of the conversation
  // If the memberOne.profileid is the same as the current profile, then that means memberOne is the current member, thus the other member is memberTwo.
  const otherMember =
    memberOne.profileId === profile.id ? memberTwo : memberOne;

  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
      <ChatHeader
        imageUrl={otherMember.profile.imageUrl}
        name={otherMember.profile.name}
        serverId={params.serverId}
        type="conversation"
      />
      {searchParams.video && (
        <MediaRoom
          chatId={conversation.id}
          video={true}
          audio={true}
        />
      )}
      {!searchParams.video && ( // 
        <>
          <ChatMessages
            member={currentMember}
            name={otherMember.profile.name}
            chatId={conversation.id}
            type="conversation"
            apiUrl="/api/socket/direct-messages"
            paramKey="conversationId"
            paramValue={conversation.id}
            socketUrl="/api/socket/direct-messages"
            socketQuery={{
              conversationId: conversation.id,
            }}
          />
          <ChatInput
            name={otherMember.profile.name}
            type="conversation"
            apiUrl="/api/socket/direct-messages"
            query={{
              conversationId: conversation.id,
            }}
          />
        </>
      )}
    </div>
  );
};

export default MemberIdPage;
