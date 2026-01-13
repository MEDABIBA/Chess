import Timer from "./Timer";

const PlayerCard = ({ playerName, getPlayerTime }: {playerName: string | null, getPlayerTime: () => string}) => {
    const displayName = playerName ?? '...';
    return (
        <div className="player-card">
            <div className="player-name">{displayName}</div>
            <div>|</div>
            <Timer getPlayerTime={getPlayerTime}/>
        </div>
    )
}
export default PlayerCard;