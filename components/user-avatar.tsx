import { cn } from "@/lib/utils";
import { Avatar, AvatarImage } from "@/components/ui/avatar";


interface UserAvatarProps {
    src?: string; 
    className?: string;
}

export const UserAvatar = ({ src, className }: UserAvatarProps) => {
    return (
        <Avatar className={cn("size-7 md:size-9", className)}>
            <AvatarImage src={src} />
        </Avatar>
    )
}