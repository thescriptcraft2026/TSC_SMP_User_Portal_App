import React from 'react';

import Instagram from '../assets/SVG/social/Instagram';
import Facebook from '../assets/SVG/social/Facebook';
import Twitter from '../assets/SVG/social/Twitter';
import LinkedIn from '../assets/SVG/social/LinkedIn';
import Youtube from '../assets/SVG/social/Youtube';
import Github from '../assets/SVG/social/Github';
import Pinterest from '../assets/SVG/social/Pinterest';
import Discord from '../assets/SVG/social/Discord';
import Twitch from '../assets/SVG/social/Twitch';
import Reddit from '../assets/SVG/social/Reddit';
import Telegram from '../assets/SVG/social/Telegram';
import Whatsapp from '../assets/SVG/social/Whatsapp';
import Behance from '../assets/SVG/social/Behance';
import Mastodon from '../assets/SVG/social/Mastodon';
import Website from '../assets/SVG/social/Website';
import Bag from '../assets/SVG/Bag';

type Props = {
  type?: string;
  size?: number;
  color?: any;
};

export const usesocialIcon = ({ type, size = 18, color = '#fff' }: Props) => {
  const iconType = type?.toLowerCase()?.trim();

  switch (iconType) {
    case 'website':
      return <Website size={size} color={color} />;

    case 'showcase':
      return <Bag size={size} color={color} />;

    // case 'showcase':
    //   return <Showcase size={size} color={color} />;

    default:
      return <Website size={size} color={color} />;
  }
};
