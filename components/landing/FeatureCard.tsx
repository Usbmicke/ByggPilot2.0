
const cardBaseStyle = "bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 transition-all duration-300";
const cardHoverEffect = "hover:scale-105 hover:shadow-[0_0_35px_rgba(59,130,246,0.2)] hover:border-blue-500/60";

export const FeatureCard = ({ title, description }) => (
    <div className={`${cardBaseStyle} ${cardHoverEffect} flex flex-col`}>
        <h3 className="text-lg font-bold text-gray-100 mb-2">{title}</h3>
        <p className="text-gray-400 text-sm flex-grow">{description}</p>
    </div>
);
