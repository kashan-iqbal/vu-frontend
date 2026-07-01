import { notFound } from "next/navigation";

function getYouTubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/,
  );
  return m ? m[1] : null;
}

export default async function Page({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  if (!code) return notFound();

  const link = "https://youtu.be/xFW3c9louKM"; // placeholder link
  const videoId = getYouTubeId(link);
  if (!videoId) return notFound();
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <span className="inline-block text-sm font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
            {code}
          </span>
          <h1 className="text-3xl font-bold text-blue-900 mt-3">
            Lecture Video
          </h1>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
              title={`${code} lecture`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </div>
  );
}
