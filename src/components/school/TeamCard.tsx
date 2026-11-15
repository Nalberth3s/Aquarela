import type { TeamMember } from '@/types'
import { Avatar } from '@/components/ui/Avatar'

export function TeamCard({ member }: { member: TeamMember }) {
  return (
    <article className="flex items-center gap-4 rounded-3xl bg-surface-container-lowest p-4 shadow-soft">
      <Avatar name={member.name} src={member.photoUrl ?? undefined} size="lg" tone={member.tone} />
      <div className="min-w-0">
        <h3 className="text-lg leading-tight">{member.name}</h3>
        <p className="mt-0.5 text-sm text-on-surface-variant">{member.role}</p>
        {member.bio && <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{member.bio}</p>}
      </div>
    </article>
  )
}
