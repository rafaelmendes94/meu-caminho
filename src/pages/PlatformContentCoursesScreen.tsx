import { Link } from "react-router-dom";
import { ContentItemsListPage } from "./PlatformContentItemsListScreen";

export default function PlatformContentCoursesScreen() {
  return (
    <ContentItemsListPage
      type="course"
      title="Cursos"
      extraActions={(row) => (
        <Link to={`/admin/content/courses/${row.id}`} className="text-blue-400 text-xs font-bold hover:underline">Aulas</Link>
      )}
    />
  );
}