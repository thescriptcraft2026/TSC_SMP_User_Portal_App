import React, { memo, useMemo, useState } from 'react';
import { Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import RenderHtml from 'react-native-render-html';

import { Fonts } from '../../constants/Fonts';
import { themeColors } from '../../theme/colors';
import { cleanHtml, stripHtml } from '../../utils/html';
import { htmlTagsStyles } from './htmlStyles';

type Props = {
  html?: string;
  maxCharacters?: number;
  textColor?: any;
};

const HtmlRenderer = ({
  html = '',
  maxCharacters = 500,
  textColor = '#FFF',
}: Props) => {
  const { width } = useWindowDimensions();
  const [expanded, setExpanded] = useState(false);

  const cleanedHtml = useMemo(() => cleanHtml(html), [html]);

  const plainText = useMemo(() => stripHtml(cleanedHtml), [cleanedHtml]);

  const shouldShowMore = plainText.length > maxCharacters;

  const displayHtml = useMemo(() => {
    if (expanded || !shouldShowMore) {
      return cleanedHtml;
    }

    return `<p>${plainText.substring(0, maxCharacters)}...</p>`;
  }, [cleanedHtml, expanded, maxCharacters, plainText, shouldShowMore]);

  return (
    <>
      <RenderHtml
        contentWidth={width}
        source={{ html: displayHtml }}
        baseStyle={{
          color: textColor,
          fontFamily: Fonts.Regular,
        }}
        systemFonts={[
          Fonts.Regular,
          Fonts.Bold,
          Fonts.Black,
          Fonts.SemiBold,
          Fonts.Italic,
        ]}
        tagsStyles={htmlTagsStyles}
      />

      {shouldShowMore && (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setExpanded(!expanded)}
        >
          <Text
            style={{
              marginTop: 6,
              color: themeColors.primary,
              fontFamily: Fonts.Bold,
            }}
          >
            {expanded ? 'Show Less' : 'Show More'}
          </Text>
        </TouchableOpacity>
      )}
    </>
  );
};

export default memo(HtmlRenderer);
