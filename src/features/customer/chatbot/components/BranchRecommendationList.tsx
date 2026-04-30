import React from 'react';
import { ScrollView } from 'react-native';

import { RecommendedBranchCard } from '@features/customer/chatbot/components/RecommendedBranchCard';
import type { RecommendedBranch } from '@features/customer/chatbot/types/chatbot';

type Props = {
  branches: RecommendedBranch[];
};

export const BranchRecommendationList = ({
  branches,
}: Props): React.JSX.Element | null => {
  if (branches.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 4,
        paddingVertical: 4,
        gap: 12,
      }}
    >
      {branches.map((branch) => (
        <RecommendedBranchCard key={branch.branchId} branch={branch} />
      ))}
    </ScrollView>
  );
};
