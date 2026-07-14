import { Link } from "react-router-dom";
import { ListOrdered } from "lucide-react";
import { ContentItemsListPage } from "./PlatformContentItemsListScreen";

export default function PlatformContentTracksScreen() {
  return (
    <ContentItemsListPage
      type="track"
      title="Trilhas"
      extraActions={(row) => (
        <Link
          to={`/admin/content/tracks/${row.id}`}
          title="Itens"
          aria-label="Itens"
          className="inline-flex items-center justify-center w-8 h-8 rounded-md text-blue-400 hover:bg-blue-400/10 transition-colors"
        >
          <ListOrdered className="w-4 h-4" />
        </Link>
      )}
    />
  );
}