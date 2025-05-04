
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MemberAvatarProps {
  photoUrl?: string;
  name: string;
}

export function MemberAvatar({ photoUrl, name }: MemberAvatarProps) {
  const getMemberInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <Avatar>
      {photoUrl ? (
        <AvatarImage src={photoUrl} alt={name} />
      ) : (
        <AvatarFallback>{getMemberInitials(name)}</AvatarFallback>
      )}
    </Avatar>
  );
}
