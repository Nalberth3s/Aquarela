import { calendarService, schoolService } from '@/services'
import { useAsync } from '@/hooks/useAsync'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useSchoolInfo } from '@/hooks/useSchoolInfo'
import { AboutPreviewSection } from './home/AboutPreviewSection'
import { ActivitiesPreviewSection } from './home/ActivitiesPreviewSection'
import { DiaryPreviewSection } from './home/DiaryPreviewSection'
import { FaqSection } from './home/FaqSection'
import { HeroSection } from './home/HeroSection'
import { HighlightsSection } from './home/HighlightsSection'
import { MomentsSection } from './home/MomentsSection'
import { RoutineSection } from './home/RoutineSection'
import { SegmentsSection } from './home/SegmentsSection'
import { UpcomingEventsSection } from './home/UpcomingEventsSection'
import { VisitSection } from './home/VisitSection'

async function loadHomeContent() {
  const [segments, routine, activities, faq, media, events] = await Promise.all([
    schoolService.listSegments(),
    schoolService.getRoutine(),
    schoolService.listActivities(),
    schoolService.listFaq(),
    schoolService.listMedia(),
    calendarService.listPublished(),
  ])
  return { segments, routine, activities, faq, media, events }
}

/** Página inicial — estrutura baseada na tela "Site Institucional" do Stitch. */
export default function HomePage() {
  useDocumentTitle()
  const info = useSchoolInfo()
  const { data } = useAsync(loadHomeContent, [])

  return (
    <>
      <HeroSection info={info} />
      <AboutPreviewSection />
      <HighlightsSection />
      {data && <MomentsSection media={data.media} />}
      {data && <UpcomingEventsSection events={data.events} />}
      {data && <SegmentsSection segments={data.segments} />}
      <DiaryPreviewSection />
      {data && (
        <div className="animate-fade-in">
          <RoutineSection steps={data.routine} />
          <ActivitiesPreviewSection activities={data.activities} />
          <FaqSection items={data.faq} />
        </div>
      )}
      <VisitSection />
    </>
  )
}
