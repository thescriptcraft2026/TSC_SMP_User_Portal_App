import { useState } from 'react';

export type ReactionType = 'Heart' | 'Love' | 'Claps' | 'Joy' | 'Laugh' | null;

type Props = {
  onSubmit?: (reaction: ReactionType) => Promise<void> | void;
};

export const useEmojiReaction = ({ onSubmit }: Props = {}) => {
  const [showReactions, setShowReactions] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState<ReactionType>(null);
  const [pendingReaction, setPendingReaction] = useState<ReactionType>(null);

  const reactions = [
    {
      id: 'Heart' as const,
      active: require('../assets/Likes/511.gif'),
      inactive: require('../assets/Likes/heart.png'),
    },
    {
      id: 'Love' as const,
      active: require('../assets/Likes/515.gif'),
      inactive: require('../assets/Likes/heart_eyes.png'),
    },
    {
      id: 'Claps' as const,
      active: require('../assets/Likes/514.gif'),
      inactive: require('../assets/Likes/clap.png'),
    },
    {
      id: 'Joy' as const,
      active: require('../assets/Likes/512.gif'),
      inactive: require('../assets/Likes/partying_face.png'),
    },
    {
      id: 'Laugh' as const,
      active: require('../assets/Likes/513.gif'),
      inactive: require('../assets/Likes/joy.png'),
    },
  ];

  const submitReaction = async (reaction: ReactionType) => {
    try {
      setPendingReaction(reaction);
      await onSubmit?.(reaction);
      setSelectedReaction(reaction);
    } catch (e) {
      console.log('REACTION ERROR', e);
    } finally {
      setPendingReaction(null);
      setShowReactions(false);
    }
  };

  return {
    reactions,
    showReactions,
    selectedReaction,
    pendingReaction,
    submitReaction,
    handleLikePress: () => submitReaction('Heart'),
    handleLongPress: () => setShowReactions(true),
    closeReactions: () => setShowReactions(false),

    getReactionAsset: (reaction: ReactionType) => {
      const found = reactions.find(r => r.id === reaction);
      if (!found) return null;

      return pendingReaction === reaction ? found.active : found.inactive;
    },
  };
};
