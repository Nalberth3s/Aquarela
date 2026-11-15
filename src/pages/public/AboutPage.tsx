import { schoolService } from '@/services'
import { useAsync } from '@/hooks/useAsync'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useSchoolInfo } from '@/hooks/useSchoolInfo'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { SkeletonList } from '@/components/ui/States'
import { PageHero } from '@/components/layout/PageHero'
import { CtaBanner } from '@/components/school/CtaBanner'
import sonhamosGrande from '@/assets/images/escola/sonhamos-grande.jpg'
import { MediaTile } from '@/components/school/MediaTile'
import { TeamCard } from '@/components/school/TeamCard'

export default function AboutPage() {
  useDocumentTitle(
    'A escola',
    'Conheça a história, a missão e a equipe do Centro Educacional Aquarela do Saber, escola de Educação Infantil em Senador Canedo - GO.',
  )
  const info = useSchoolInfo()
  const { data } = useAsync(
    () =>
      Promise.all([schoolService.listValues(), schoolService.listTeam(), schoolService.listMedia()]).then(
        ([values, team, media]) => ({ values, team, media }),
      ),
    [],
  )
  const sopaVideo = data?.media.find((m) => m.id === 'video-sopa')

  return (
    <>
      <PageHero
        eyebrow="A escola"
        tone="sage"
        title={
          <>
            Acompanhando <span className="wavy-underline text-primary">primeiros passos</span> com afeto
          </>
        }
        description={`A Aquarela do Saber é uma escola de Educação Infantil em ${info.city} - ${info.state}, dedicada a bebês e crianças de 4 meses a 5 anos.`}
      />

      <section className="pb-20 sm:pb-28">
        <Container className="grid items-start gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <img
              src={sonhamosGrande}
              alt="Sonhamos grande desde pequenos: crianças da Aquarela do Saber com o uniforme da escola"
              className="mx-auto w-full max-w-sm rounded-[2rem] shadow-lift"
            />
          </Reveal>
          <Reveal className="space-y-5 text-lg leading-relaxed text-on-surface-variant">
            <h2 className="text-3xl text-on-surface">Nossa história</h2>
            <p>
              Tudo começou com uma pequena turma e uma grande convicção: a primeira infância merece ser vivida com
              tempo, afeto e boas experiências. Ao longo dos anos, a escola cresceu junto com as famílias do bairro —
              sem perder a proximidade que nos define.
            </p>
            <p>
              Hoje, contamos com uma equipe formada por pedagogas especializadas, auxiliares dedicadas, nutricionista
              e coordenação pedagógica presente, todas comprometidas com uma Educação Infantil de qualidade.
            </p>
          </Reveal>
        </Container>
      </section>

      <section className="bg-surface-container-low/50 py-20 sm:py-28">
        <Container className="grid gap-12 lg:grid-cols-3">
          <Reveal>
            <p className="mb-4 text-xs font-bold tracking-[0.16em] text-outline uppercase">Missão</p>
            <p className="font-display text-2xl leading-snug">
              Educar e cuidar de cada criança de forma integral, respeitando sua individualidade e promovendo
              experiências significativas.
            </p>
          </Reveal>
          <Reveal delay={100}>
            <p className="mb-4 text-xs font-bold tracking-[0.16em] text-outline uppercase">Visão</p>
            <p className="font-display text-2xl leading-snug">
              Ser referência em Educação Infantil em Senador Canedo pela qualidade pedagógica e pelo acolhimento.
            </p>
          </Reveal>
          <Reveal delay={200}>
            <p className="mb-4 text-xs font-bold tracking-[0.16em] text-outline uppercase">Valores</p>
            {data ? (
              <ul className="space-y-4">
                {data.values.map((v) => (
                  <li key={v.title}>
                    <p className="font-semibold text-on-surface">{v.title}</p>
                    <p className="text-on-surface-variant">{v.text}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <SkeletonList rows={2} />
            )}
          </Reveal>
        </Container>
      </section>

      {/* Aparece quando a coordenação cadastra a equipe (Equipe e acessos → Equipe no site). */}
      {!!data?.team.length && (
      <section className="pt-20 sm:pt-28">
        <Container>
          <SectionHeading
            eyebrow="Equipe"
            tone="coral"
            title="Quem cuida e educa"
            description="Profissionais qualificadas, em formação contínua, que conhecem cada criança pelo nome."
          />
          <div className="mt-12 grid items-start gap-8 lg:grid-cols-[1fr_18rem]">
            <ul className="grid gap-3 sm:grid-cols-2">
              {data?.team.map((m, i) => (
                <Reveal as="li" key={m.id} delay={i * 60}>
                  <TeamCard member={m} />
                </Reveal>
              ))}
            </ul>
            {sopaVideo && <MediaTile media={sopaVideo} />}
          </div>
        </Container>
      </section>
      )}

      <CtaBanner />
    </>
  )
}
