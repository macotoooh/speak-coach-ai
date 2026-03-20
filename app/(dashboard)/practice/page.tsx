import PracticePage from "@/components/PracticePage";

type PracticeRouteProps = {
  searchParams: Promise<{
    reviewId?: string | string[];
  }>;
};

export default async function PracticeRoute({
  searchParams,
}: PracticeRouteProps) {
  const params = await searchParams;
  const reviewId = Array.isArray(params.reviewId)
    ? params.reviewId[0]
    : params.reviewId;

  return <PracticePage reviewId={reviewId} />;
}
