
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MemberAvatarProps {
  photoUrl?: string;
  name: string;
  size?: "sm" | "md" | "lg"; // Add size prop with allowed values
}

export function MemberAvatar({ photoUrl, name, size = "md" }: MemberAvatarProps) {
  const getMemberInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // Apply different sizes based on the size prop
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10", // Default size from Avatar component
    lg: "h-16 w-16"
  };

  return (
    <Avatar className={size ? sizeClasses[size] : undefined}>
      {photoUrl ? (
        <AvatarImage src={photoUrl} alt={name} />
      ) : (
        <AvatarFallback>{getMemberInitials(name)}</AvatarFallback>
      )}
    </Avatar>
  );
}
