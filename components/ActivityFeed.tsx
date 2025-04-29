import React, { useState, useEffect } from 'react';
import { ActivityItem } from '@/types/activity';
import { transformActivities } from '@/utils/activityTransformers';
import { useWeb3 } from '@/hooks/useWeb3';

interface ActivityFeedProps {
  activities: ActivityItem[];
  onActivityClick?: (activity: ActivityItem) => void;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities, onActivityClick }) => {
  const [transformedActivities, setTransformedActivities] = useState<ActivityItem[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ActivityItem[]>([]);
  const [selectedVerb, setSelectedVerb] = useState<string>('all');
  const { isConnected } = useWeb3();

  // Get unique verbs for filter options
  const uniqueVerbs = React.useMemo(() => {
    const verbs = new Set(activities.map(activity => activity.verb));
    return ['all', ...Array.from(verbs)];
  }, [activities]);

  // Transform activities when they change
  useEffect(() => {
    const transform = async () => {
      const transformed = await transformActivities(activities);
      setTransformedActivities(transformed);
    };
    transform();
  }, [activities]);

  // Filter activities based on selected verb
  useEffect(() => {
    if (selectedVerb === 'all') {
      setFilteredActivities(transformedActivities);
    } else {
      setFilteredActivities(transformedActivities.filter(activity => activity.verb === selectedVerb));
    }
  }, [transformedActivities, selectedVerb]);

  if (!isConnected) {
    return (
      <div className="p-4 text-center text-gray-500">
        Please connect your wallet to view activities
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg">
        {uniqueVerbs.map(verb => (
          <button
            key={verb}
            onClick={() => setSelectedVerb(verb)}
            className={`px-3 py-1 rounded-full text-sm ${
              selectedVerb === verb
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {verb.charAt(0).toUpperCase() + verb.slice(1)}
          </button>
        ))}
      </div>

      {/* Activity List */}
      <div className="space-y-4">
        {filteredActivities.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No activities found
          </div>
        ) : (
          filteredActivities.map(activity => (
            <div
              key={activity.id}
              onClick={() => onActivityClick?.(activity)}
              className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start space-x-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(activity.timestamp || '').toLocaleString()}
                  </p>
                </div>
                {activity.context?.icon && (
                  <div className="flex-shrink-0">
                    <img
                      src={activity.context.icon}
                      alt=""
                      className="w-6 h-6 rounded-full"
                    />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityFeed; 