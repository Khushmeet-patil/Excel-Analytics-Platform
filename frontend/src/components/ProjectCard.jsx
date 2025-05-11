import { Calendar, FileSpreadsheet, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProjectCard({ project }) {
  const { id, _id, name, description, lastModified, fileCount } = project;

  // Use either id or _id (MongoDB ObjectId) depending on what's available
  const projectId = id || _id;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-5">
        <h3 className="text-lg font-semibold">{name}</h3>
        <p className="text-gray-600 mt-1 text-sm line-clamp-2">{description}</p>

        <div className="flex items-center mt-4 text-gray-500 text-sm">
          <Calendar size={16} className="mr-1" />
          <span>Last modified: {formatDate(lastModified)}</span>
        </div>

        <div className="flex items-center mt-2 text-gray-500 text-sm">
          <FileSpreadsheet size={16} className="mr-1" />
          <span>{fileCount} Excel file{fileCount !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-end">
        <Link
          to={`/projects/${projectId}`}
          className="text-green-600 flex items-center text-sm font-medium"
        >
          View Project
          <ArrowRight size={16} className="ml-1" />
        </Link>
      </div>
    </div>
  );
}
