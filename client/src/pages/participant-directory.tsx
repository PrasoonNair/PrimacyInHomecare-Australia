import React from 'react';
import { ParticipantListView } from '@/components/participants/participant-list-view';

export default function ParticipantDirectoryPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <ParticipantListView />
    </div>
  );
}