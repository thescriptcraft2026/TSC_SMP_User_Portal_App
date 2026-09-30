import { useState } from 'react';

export type ReactionType = 'Heart' | 'Love' | 'Claps' | 'Joy' | 'Laugh' | null;

type Props = {
  onSubmit?: (reaction: ReactionType) => Promise<void> | void;

  isOpen?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
};

export const usePostReaction = ({
  onSubmit,
  isOpen,
  onOpen,
  onClose,
}: Props = {}) => {
  const showReactions = isOpen ?? false;

  const [selectedReaction, setSelectedReaction] = useState<ReactionType>(null);

  const [pendingReaction, setPendingReaction] = useState<ReactionType>(null);

  // 🔥 USE ALL LOCAL ASSETS
  const reactions = [
    {
      id: 'Heart',
      active: require('../assets/Likes/511.gif'),
      inactive: require('../assets/Likes/heart.png'),
    },
    {
      id: 'Love',
      active: require('../assets/Likes/515.gif'),
      inactive: require('../assets/Likes/heart_eyes.png'),
    },
    {
      id: 'Claps',
      active: require('../assets/Likes/514.gif'),
      inactive: require('../assets/Likes/clap.png'),
    },
    {
      id: 'Joy',
      active: require('../assets/Likes/512.gif'),
      inactive: require('../assets/Likes/partying_face.png'),
    },
    {
      id: 'Laugh',
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
      onClose?.();
    }
  };

  const handleLikePress = async () => {
    await submitReaction('Heart');
  };
  const handleLongPress = () => {
    onOpen?.();
  };

  const closeReactions = () => {
    onClose?.();
  };

  const getReactionAsset = (reaction: ReactionType) => {
    const found = reactions.find(item => item.id === reaction);

    if (!found) return null;

    // 🔥 while api loading show webp
    if (pendingReaction === reaction) {
      return found.active;
    }

    // 🔥 after success show png
    return found.inactive;
  };

  return {
    reactions,

    showReactions,

    selectedReaction,
    pendingReaction,

    submitReaction,
    handleLikePress,
    handleLongPress,
    closeReactions,

    getReactionAsset,
  };
};
