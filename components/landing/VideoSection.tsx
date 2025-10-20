
const VideoSection = () => (
    <section className="py-16 md:py-24">
        <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">Se din digitala kollega i action.</h2>
            <div className="max-w-4xl mx-auto aspect-video bg-gray-800/50 border border-gray-700 rounded-lg flex items-center justify-center text-gray-500 overflow-hidden shadow-2xl">
                <video src="/images/ByggPilot-ritningen.mp4" autoPlay loop muted playsInline className="w-full h-full object-cover"></video>
            </div>
        </div>
    </section>
);

export default VideoSection;
