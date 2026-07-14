import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import { ContentItemsListPage } from "./PlatformContentItemsListScreen";

export default function PlatformContentCoursesScreen() {
  return (
    <ContentItemsListPage
      type="course"
      title="Cursos"
      extraActions={(row) => (
        <Link
          to={`/admin/content/courses/${row.id}`}
          title="Aulas"
          aria-label="Aulas"
          className="inline-flex items-center justify-center w-8 h-8 rounded-md text-blue-400 hover:bg-blue-400/10 transition-colors"
        >
          <GraduationCap className="w-4 h-4" />
        </Link>
      )}
    />
  );
}