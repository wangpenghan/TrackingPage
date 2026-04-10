/**
 * @name DMR 系统
 * @mode axure
 *
 * 参考资料：
 * - /rules/development-guide.md
 * - /skills/axure-export-workflow/SKILL.md
 * - /rules/axure-api-guide.md
 */
import React, { useState } from 'react';
import DMRSidebar from './components/DMRSidebar';
import PTTCall from './components/PTTCall';
import RecordingList from './components/RecordingList';
import { Group } from './types/dmr';
import { CALL_GROUPS, PLAYBACK_GROUPS } from './data/groups';
import './style.css';

const Component = () => {
  const [selectedGroupId, setSelectedGroupId] = useState<string>('call-business');
  const [selectedGroup, setSelectedGroup] = useState<Group>(CALL_GROUPS[4]);

  const handleSelectGroup = (group: Group) => {
    setSelectedGroupId(group.id);
    setSelectedGroup(group);
  };

  const renderContent = () => {
    if (selectedGroup.category === 'call') {
      return <PTTCall group={selectedGroup as any} />;
    } else if (selectedGroup.category === 'playback') {
      return <RecordingList />;
    } else {
      return <div>未知分组类型</div>;
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-white">
      <DMRSidebar
        selectedGroupId={selectedGroupId}
        onSelectGroup={handleSelectGroup}
      />
      <main className="flex-1 overflow-hidden">
        {renderContent()}
      </main>
    </div>
  );
};

export default Component;
