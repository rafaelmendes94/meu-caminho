import { Link } from "react-router-dom";
import { ContentItemsListPage } from "./PlatformContentItemsListScreen";

export default function PlatformContentTracksScreen() {
  return (
    <ContentItemsListPage
      type="track"
      title="Trilhas"
      extraActions={(row) => (
        <Link to={`/admin/content/tracks/${row.id}`} className="text-blue-400 text-xs font-bold hover:underline">Itens</Link>
      )}
    />
  );
}