import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Calendar from '../../../assets/SVG/Calendar';
import { themeColors } from '../../../theme/colors';
import { Fonts } from '../../../constants/Fonts';
import Plus from '../../../assets/SVG/Plus';
import Chat from '../../../assets/SVG/Chat';
import { useNavigation } from '@react-navigation/native';
import Phone from '../../../assets/SVG/Phone';
import Location from '../../../assets/SVG/Location';
import Email from '../../../assets/SVG/Email';
import AboutMe from '../../../assets/SVG/AboutMe';
import Role from '../../../assets/SVG/Role';
import GenreBadge from '../../../components/Badges/GenreBadge';
import Pen from '../../../assets/SVG/Pen';
import Bag from '../../../assets/SVG/Bag';
import ProfileCompletionCard from './ProfileCompletionCard';
import Ionicons from '@react-native-vector-icons/ionicons';
import Trophy from '../../../assets/SVG/Trophy';
import Achivements from '../../../assets/SVG/Achivements';
import FastImage from 'react-native-fast-image';
import Scope from '../../../assets/SVG/Scope';
import Pending from '../../../assets/SVG/Pending';
import CheckTwo from '../../../assets/SVG/CheckTwo';
import { CollaborationBadge } from '../../../components/Badges/CollaborationBadge';
import { usesocialIcon } from '../../../hooks/useSocialIcon';
import Trash from '../../../assets/SVG/Trash';
import { formatCount } from '../../../utils/date';
import Link from '../../../assets/SVG/Link';
import Avatar from '../../../components/Avatar/Avatar';
import Gender from '../../../assets/SVG/Gender';
import DOB from '../../../assets/SVG/DOB';

type Experience = {
  id: string;
  role: string;
  company: string;
  type: string;
  start: string;
  end: string;
  description: string;
};

type Achievement = {
  id: string;
  title: string;
  color: string;
  winning_position: number | null;
};

type onLinePrefrence = {
  id: string;
  type: string;
  link: string;
};

type Props = {
  name: string;
  username: string;
  avatar: any;
  bannerImage?: string;
  verified?: boolean;

  phone?: string;
  email?: string;
  location?: string;
  joined?: string;

  bio?: string;

  roles?: string[];
  collaborationRoles?: string[];
  collaborationType?: any;
  experiences?: Experience[];
  achievements?: Achievement[];
  onLinePrefrence?: onLinePrefrence[];

  posts: number;
  followers: string;
  following: number;
  connections: number;
  shortBio?: string;

  onConnet?: () => void;
  connectionStatus?: 'none' | 'pending' | 'accepted' | any;
  relationship?: boolean | any;
  onFollow?: () => void;
  onEdit?: () => void;
  onEditAbout?: () => void;
  onCollaboration?: () => void;
  onEditApplyFor?: () => void;
  onEditRoles?: () => void;
  onEditExperience?: () => void;

  onEditAvatar?: () => void;
  onEditBanner?: () => void;
  onMenuPress?: (e: any) => void;
  onAccept?: () => void;
  onDecline?: () => void;

  isOwnProfile?: boolean;
  currentUserId?: number;
  handleChat?: () => void;
  onEditOnlinePrefrence?: () => void;
  isBlocked?: any;
  handleExpDelete?: (id: any) => void;

  gender?: string;
  dob?: string;
  city?: string;
  state?: string;
  country?: string;
};

const ProfileHeader = ({
  name,
  username,
  avatar,
  bannerImage,
  verified,
  phone,
  email,
  location,
  joined,
  bio,
  roles = [],
  collaborationRoles = [],
  collaborationType,
  experiences = [],
  achievements = [],
  onLinePrefrence = [],
  followers,
  following,
  connections,
  shortBio,
  onConnet,
  connectionStatus,
  onFollow,
  onEdit,
  onEditAbout,
  onCollaboration,
  onEditApplyFor,
  onEditRoles,
  onEditExperience,
  onEditAvatar,
  onEditBanner,
  onMenuPress,
  isOwnProfile = false,
  relationship,
  onAccept,
  onDecline,
  currentUserId,
  handleChat,
  onEditOnlinePrefrence,
  isBlocked,
  handleExpDelete,
  gender,
  dob,
  city,
  state,
  country,
}: Props) => {
  const isDark = true;
  const navigation = useNavigation<any>();
  const isFollowing = relationship?.isFollowing ?? false;
  const status = connectionStatus?.status;
  const isAccepted = status === 'accepted';
  const [avatarLoading, setAvatarLoading] = useState(true);
  const [bannerLoading, setBannerLoading] = useState(true);

  // ✅ check direction properly
  const currentUserID = currentUserId;

  const isIncomingRequest =
    status === 'pending' && connectionStatus?.receiver_id === currentUserID;

  const isOutgoingRequest =
    status === 'pending' && connectionStatus?.requester_id === currentUserID;

  const bannerColors = useMemo(
    () =>
      isDark
        ? ['#0f0c08', '#3a2c12', '#6a5320']
        : ['#f5f5f5', '#e6e6e6', '#d4d4d4'],
    [isDark],
  );
  const textColor = isDark ? themeColors.slate : themeColors.black;
  const iconColor = isDark ? '#ccc' : '#555';

  const { primaryRoles, secondaryRoles } = useMemo(() => {
    const primary: string[] = [];
    const secondary: string[] = [];

    roles?.forEach((item: any) => {
      const roleName = item.display_name; // ✅ FIX

      if (item?.UserRole?.isPrimary) {
        primary.push(roleName);
      } else {
        secondary.push(roleName);
      }
    });

    return {
      primaryRoles: primary,
      secondaryRoles: secondary,
    };
  }, [roles]);

  console.log('PROFILE COMPLETION DATA:', {
    avatar: !!avatar,
    bannerImage: !!bannerImage,
    shortBio: !!shortBio?.trim(),
    phone: !!phone?.trim(),
    gender: !!gender?.trim(),
    dob: !!dob?.trim(),
    city: !!city?.trim(),
    state: !!state?.trim(),
    country: !!country?.trim(),
    primaryRoles: primaryRoles.length,
    secondaryRoles: secondaryRoles.length,
    bio: !!bio?.trim(),
    experiences: experiences?.length,
    links: onLinePrefrence?.length,
    collaborationRoles: collaborationRoles?.length,
    collaborationType: collaborationType,
  });


  const profileCompletion = useMemo(() => {
    let total = 0;

    // ✅ Profile Picture
    if (avatar) total += 15;

    // ✅ Cover Picture
    if (bannerImage) total += 15;

    // ✅ Short Bio
    if (shortBio?.trim()) total += 6;

    // ✅ Phone
    if (phone?.trim()) total += 3;

    if (gender?.trim()) total += 3;
    if (dob?.trim()) total += 3;
    if (city?.trim()) total += 3;
    if (state?.trim()) total += 3;
    if (country?.trim()) total += 3;

    // ✅ Roles (Primary OR Secondary)
    if (primaryRoles.length > 0 || secondaryRoles.length > 0) {
      total += 10;
    }

    // ✅ About
    if (bio?.trim()) total += 10;

    // ✅ Experience
    if (experiences?.length > 0) total += 10;

    // ✅ Links
    if (onLinePrefrence?.length > 0) total += 6;

    // Collaboration
    if (
      collaborationRoles?.length > 0 ||
      collaborationType
    ) {
      total += 10;
    }


    return Math.min(total, 100);
  }, [
    avatar,
    bannerImage,
    shortBio,
    phone,
    gender,
    dob,
    city,
    state,
    country,
    bio,
    experiences,
    onLinePrefrence,
    primaryRoles,
    secondaryRoles,
    collaborationRoles,
    collaborationType
  ]);


  const missingFields = [];

  if (!avatar) missingFields.push('Profile Photo');
  if (!bannerImage) missingFields.push('Cover Photo');
  if (!shortBio?.trim()) missingFields.push('Short Bio');
  if (!phone?.trim()) missingFields.push('Phone');
  if (!gender?.trim()) missingFields.push('Gender');
  if (!dob?.trim()) missingFields.push('DOB');
  if (!city?.trim()) missingFields.push('City');
  if (!state?.trim()) missingFields.push('State');
  if (!country?.trim()) missingFields.push('Country');
  if (!bio?.trim()) missingFields.push('About');
  if (!experiences?.length) missingFields.push('Experience');
  if (!onLinePrefrence?.length) missingFields.push('Links');
  if (
    !collaborationRoles?.length &&
    !collaborationType
  ) {
    missingFields.push('Collaboration');
  }

  return (
    <View>
      {/* 🔥 BANNER (IMAGE OR GRADIENT) */}
      <View style={styles.bannerWrapper}>
        {bannerImage ? (
          <>
            {bannerLoading && (
              <View style={styles.bannerLoader}>
                <ActivityIndicator size="large" color={themeColors.primary} />
              </View>
            )}

            <FastImage
              source={{ uri: bannerImage }}
              style={[
                styles.banner,
                {
                  opacity: bannerLoading ? 0 : 1,
                },
              ]}
              resizeMode={FastImage.resizeMode.cover}
              onLoadStart={() => bannerImage && setBannerLoading(true)}
              onLoadEnd={() => setBannerLoading(false)}
              onError={() => setBannerLoading(false)}
            />
          </>
        ) : (
          <LinearGradient
            colors={bannerColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.banner}
          />
        )}

        {/* Edit Icon */}
        {isOwnProfile && (
          <TouchableOpacity
            style={[
              styles.editIcon,
              {
                backgroundColor: isDark ? themeColors.card : themeColors.card2,
              },
            ]}
            onPress={onEditBanner}
          >
            <Ionicons name="camera" size={16} color={themeColors.white} />
          </TouchableOpacity>
        )}
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginHorizontal: 10,
        }}
      >
        {/* LEFT SIDE */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            flex: 1, // 🔥 IMPORTANT
            paddingRight: 10,
          }}
        >
          {/* AVATAR */}
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarContainer}>
              <Avatar
                uri={avatar}
                name={name}
                size={90}
                onLoadStart={() => setAvatarLoading(true)}
                onLoadEnd={() => setAvatarLoading(false)}
                onError={() => setAvatarLoading(false)}
                onLoadingChange={setAvatarLoading}
                borderShow={true}
              />
            </View>

            {isOwnProfile && (
              <TouchableOpacity
                style={[
                  styles.editIconTwo,
                  {
                    backgroundColor: themeColors.card,
                  },
                ]}
                onPress={onEditAvatar}
              >
                <Ionicons name="camera" size={16} color={themeColors.white} />
              </TouchableOpacity>
            )}
          </View>

          {/* NAME SECTION */}
          <View style={{ flex: 1 }}>
            <View style={styles.nameRow}>
              <Text
                style={[styles.name, { color: textColor }]}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {name}
              </Text>
            </View>

            <View style={styles.metaRow}>
              {username && (
                <Text
                  style={[styles.metaText, { color: textColor }]}
                  numberOfLines={1}
                >
                  @{username}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* RIGHT SIDE */}
        {isOwnProfile && (
          <TouchableOpacity
            style={[
              styles.editBtn,
              {
                backgroundColor: isDark ? themeColors.card : themeColors.card2,
              },
            ]}
            onPress={onEdit}
          >
            <Pen size={16} color={iconColor} />
          </TouchableOpacity>
        )}
      </View>

      {!isBlocked && !isOwnProfile && (
        <View style={styles.btnWraper}>
          {/* FOLLOW BUTTON */}
          <TouchableOpacity
            style={[
              styles.primaryBtn,
              { flex: 1, justifyContent: 'center' },
              isFollowing && {
                borderWidth: 0.5,
                borderColor: themeColors.primary,
                backgroundColor: 'transparent',
              },
            ]}
            activeOpacity={0.8}
            onPress={onFollow}
          >
            {isFollowing ? (
              <CheckTwo size={16} color={themeColors.primary} />
            ) : (
              <Plus size={16} color="#fff" />
            )}

            <Text
              style={[
                styles.primaryText,
                isFollowing && { color: themeColors.primary },
              ]}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </Text>
          </TouchableOpacity>

          {/* 🔥 CONNECTION BUTTON LOGIC */}
          {isIncomingRequest ? (
            <>
              <TouchableOpacity
                style={[
                  styles.iconBtn,
                  styles.declineBtn,
                  {
                    flex: 1,
                    justifyContent: 'center',
                    backgroundColor: isDark ? 'rgba(255,0,0,0.08)' : '#ffecec',
                    borderColor: isDark ? 'rgba(239,68,68,0.4)' : '#ef4444',
                  },
                ]}
                onPress={onDecline}
              >
                <Text style={[styles.btnText, { color: '#ef4444' }]}>
                  Decline
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.iconBtn,
                  styles.acceptBtn,
                  {
                    flex: 1,
                    justifyContent: 'center',
                    backgroundColor: isDark
                      ? 'rgba(34,197,94,0.08)'
                      : '#eafff3',
                    borderColor: isDark ? 'rgba(34,197,94,0.4)' : '#22c55e',
                  },
                ]}
                onPress={onAccept}
              >
                <Text
                  style={[
                    styles.btnText,
                    {
                      color: isDark
                        ? themeColors.lightGreen
                        : themeColors.green,
                    },
                  ]}
                >
                  Accept
                </Text>
              </TouchableOpacity>
            </>
          ) : isAccepted ? (
            // ✅ SHOW MESSAGE
            <TouchableOpacity
              style={[
                styles.secondaryBtn,
                { flex: 1, justifyContent: 'center' },
                { backgroundColor: isDark ? '#2a2a2d' : '#E9EEF3' },
              ]}
              activeOpacity={0.8}
              onPress={handleChat}
            >
              <Chat
                size={16}
                color={isDark ? themeColors.white : themeColors.black}
              />
              <Text
                style={[
                  styles.secondaryText,
                  { color: isDark ? themeColors.white : themeColors.black },
                ]}
              >
                Message
              </Text>
            </TouchableOpacity>
          ) : (
            // ✅ SHOW CONNECT / PENDING
            <TouchableOpacity
              style={[
                isOutgoingRequest || isIncomingRequest
                  ? styles.secondaryBtn
                  : styles.primaryBtn,
                { flex: 1, justifyContent: 'center' },
                (isOutgoingRequest || isIncomingRequest) && {
                  backgroundColor: isDark ? '#2a2a2d' : '#E9EEF3',
                },
              ]}
              activeOpacity={0.8}
              onPress={onConnet}
            >
              {(isOutgoingRequest || isIncomingRequest) && (
                <Pending
                  size={16}
                  color={isDark ? themeColors.white : themeColors.black}
                />
              )}

              <Text
                style={[
                  isOutgoingRequest || isIncomingRequest
                    ? styles.secondaryText
                    : styles.primaryText,
                  (isOutgoingRequest || isIncomingRequest) && {
                    color: isDark ? themeColors.white : themeColors.black,
                  },
                ]}
              >
                {isIncomingRequest
                  ? 'Pending' // ✅ RECEIVED
                  : isOutgoingRequest
                    ? 'Requested' // ✅ SENT
                    : 'Connect'}
              </Text>
            </TouchableOpacity>
          )}
          {!isAccepted && (
            <TouchableOpacity
              style={styles.messageIconBtn}
              activeOpacity={0.8}
              onPress={handleChat}
            >
              <Chat
                size={20}
                color={isDark ? themeColors.white : themeColors.black}
              />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* 🔥 STATS */}
      {!isBlocked && (
        <View
          style={[
            styles.followCard,
            {
              backgroundColor: isDark ? '#1a1a1a' : themeColors.white,
              marginTop: isOwnProfile ? 10 : 10,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.followItem}
            onPress={() =>
              navigation.navigate('MyConnections', {
                initialTab: 0,
                user_name: username, // ✅ ADD THIS
              })
            }
          >
            <Text style={[styles.followCount, { color: themeColors.primary }]}>
              {formatCount(connections)}
            </Text>
            <Text style={[styles.followLabel, { color: textColor }]}>
              Connections
            </Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.followItem}
            onPress={() =>
              navigation.navigate('MyConnections', {
                initialTab: 1,
                user_name: username,
              })
            }
          >
            <Text style={[styles.followCount, { color: themeColors.primary }]}>
              {formatCount(followers)}
            </Text>
            <Text style={[styles.followLabel, { color: textColor }]}>
              Followers
            </Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.followItem}
            onPress={() =>
              navigation.navigate('MyConnections', {
                initialTab: 2,
                user_name: username,
              })
            }
          >
            <Text style={[styles.followCount, { color: themeColors.primary }]}>
              {formatCount(following)}
            </Text>
            <Text style={[styles.followLabel, { color: textColor }]}>
              Following
            </Text>
          </TouchableOpacity>




        </View>
      )}

      {isOwnProfile && profileCompletion < 100 && (
        <ProfileCompletionCard
          percentage={profileCompletion}
          missingFields={missingFields}
        />
      )}

      {/* Short Bio & Details */}
      {!isBlocked && (
        <View
          style={[
            styles.infoCard,
            { backgroundColor: isDark ? '#1a1a1a' : themeColors.white },
          ]}
        >
          {/* 🔹 GRID */}
          <View style={styles.infoGrid}>
            {phone && <InfoItem icon={<Phone />} text={phone} />}
            {email && <InfoItem icon={<Email />} text={email} />}
            {location && <InfoItem icon={<Location />} text={location} />}
            {joined && <InfoItem icon={<Calendar />} text={joined} />}
            {gender && <InfoItem icon={<Gender />} text={gender} />}
            {dob && <InfoItem icon={<DOB />} text={dob} />}
          </View>

          {(shortBio?.length ?? 0) > 0 && (
            <>
              {/* 🔹 Divider */}
              <View style={styles.dividerLine} />

              {/* 🔹 Bio */}
              <Text style={[styles.shortBio, { color: textColor }]}>
                {shortBio}
              </Text>
            </>
          )}
        </View>
      )}

      {/* 🔥 Achievements */}
      {achievements.length > 0 && !isBlocked && (
        <View
          style={[
            styles.infoCard,
            { backgroundColor: isDark ? '#1a1a1a' : themeColors.white },
          ]}
        >
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Achivements size={18} color={iconColor} />
            <Text style={[styles.bioLabel, { color: textColor }]}>
              Achievements
            </Text>
          </View>

          <View style={styles.dividerLine} />

          {/* Cards */}
          <View style={styles.row}>
            {achievements.map((item, index) => {
              const colors = [
                '#FFCB05',
                '#00a63e',
                '#00bba7',
                '#00a6f4',
                '#615fff',
                '#8e51ff',
                '#ad46ff',
                '#ff6b6b',
                '#4ecdc4',
              ];
              const getWinningLabel = (position: number | null) => {
                if (position == null || position === 1) {
                  return 'WINNER 🏆';
                }

                if (position === 2) {
                  return '2nd Runner 🥈';
                }

                if (position === 3) {
                  return '3rd Position 🥉';
                }

                const suffix =
                  position % 10 === 1 && position !== 11
                    ? 'st'
                    : position % 10 === 2 && position !== 12
                      ? 'nd'
                      : position % 10 === 3 && position !== 13
                        ? 'rd'
                        : 'th';

                return `${position}${suffix} Position`;
              };
              return (
                <View key={index} style={styles.cardWrapper}>
                  <View
                    style={[
                      styles.achievmentCard,
                      {
                        backgroundColor: isDark
                          ? themeColors.card2
                          : themeColors.card2,
                      },
                    ]}
                  >
                    <Trophy
                      size={45}
                      color={colors[index % colors.length]}
                      outlineColor={
                        isDark ? themeColors.white : themeColors.black
                      }
                    />
                    <Text
                      style={[
                        styles.achievmentTxt,
                        {
                          color: textColor,
                          backgroundColor: `${String(themeColors.green)}80`,
                        },
                      ]}
                    >
                      {getWinningLabel(item?.winning_position)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Collaboration */}
      {!isBlocked && (
        <View
          style={[
            styles.infoCard,
            { backgroundColor: isDark ? '#1a1a1a' : themeColors.white },
          ]}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}
            >
              <Scope size={18} color={iconColor} />
              <Text style={[styles.bioLabel, { color: textColor }]}>
                Collaboration
              </Text>
            </View>
            {isOwnProfile && (
              <TouchableOpacity onPress={onCollaboration}>
                <Pen size={16} color={iconColor} />
              </TouchableOpacity>
            )}
          </View>
          {/* 🔹 Divider */}
          <View style={[styles.dividerLine]} />

          {collaborationType === 'WORK' || collaborationType === 'HIRING' ? (
            <>
              <Text style={[styles.expDuration, { marginBottom: 4 }]}>
                Work Status:
              </Text>

              <CollaborationBadge type={collaborationType} />
            </>
          ) : null}

          {/* 🔹 Bio */}
          {collaborationRoles?.length > 0 || collaborationType ? (
            <View style={{ paddingVertical: 10 }}>
              <Text style={[styles.expDuration, { marginBottom: 4 }]}>
                Roles:
              </Text>

              {/* ROLES */}
              {collaborationRoles?.length > 0 && (
                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    gap: 8,
                  }}
                >
                  {collaborationRoles.map((role: any, index: number) => (
                    <Text
                      key={`${role.id}-${index}`} // ✅ FIX duplicate key issue
                      style={{
                        fontSize: 10,
                        fontFamily: Fonts.Medium,
                        textTransform: 'uppercase',
                        color: isDark ? themeColors.white : themeColors.black,
                      }}
                    >
                      {role?.display_name}
                      {index !== collaborationRoles.length - 1 ? ', ' : ''}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          ) : (
            <View style={{ paddingVertical: 10, alignItems: 'center' }}>
              <Text
                style={{
                  color: isDark ? '#aaa' : '#666',
                  fontSize: 13,
                }}
              >
                No Collaboration Roles added
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Roles */}
      {!isBlocked && (
        <View
          style={[
            styles.infoCard,
            { backgroundColor: isDark ? '#1a1a1a' : themeColors.white },
          ]}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}
            >
              <Role size={18} color={iconColor} />
              <Text style={[styles.bioLabel, { color: textColor }]}>
                Primary & Secondary Roles
              </Text>
            </View>

            {isOwnProfile && (
              <TouchableOpacity onPress={onEditRoles}>
                <Pen size={16} color={iconColor} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.dividerLine} />

          {/* Empty State */}
          {primaryRoles?.length === 0 && secondaryRoles?.length === 0 ? (
            <View style={{ paddingVertical: 10, alignItems: 'center' }}>
              <Text
                style={{
                  color: isDark ? '#aaa' : '#666',
                  fontSize: 13,
                }}
              >
                No roles added yet.
              </Text>
            </View>
          ) : (
            <>
              {primaryRoles?.length > 0 && (
                <View style={styles.roleContainer}>
                  <Text style={[styles.rolesLabel, { color: textColor }]}>
                    Primary Roles
                  </Text>

                  <View
                    style={{
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      gap: 10,
                    }}
                  >
                    {primaryRoles.map((role, index) => (
                      <GenreBadge key={index} label={role} size="xs" />
                    ))}
                  </View>
                </View>
              )}

              {secondaryRoles?.length > 0 && (
                <View style={styles.roleContainer}>
                  <Text style={[styles.rolesLabel, { color: textColor }]}>
                    Secondary Roles
                  </Text>

                  <View
                    style={{
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      gap: 10,
                    }}
                  >
                    {secondaryRoles.map((role, index) => (
                      <GenreBadge key={index} label={role} size="xs" />
                    ))}
                  </View>
                </View>
              )}
            </>
          )}
        </View>
      )}

      {/* About Me */}
      {!isBlocked && (
        <View
          style={[
            styles.infoCard,
            { backgroundColor: isDark ? '#1a1a1a' : themeColors.white },
          ]}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}
            >
              <AboutMe size={18} color={iconColor} />
              <Text style={[styles.bioLabel, { color: textColor }]}>
                About
              </Text>
            </View>

            {isOwnProfile && (
              <TouchableOpacity onPress={onEditAbout}>
                <Pen size={16} color={iconColor} />
              </TouchableOpacity>
            )}
          </View>

          {/* Divider */}
          <View style={styles.dividerLine} />

          {/* Bio / Empty State */}
          {bio?.trim() ? (
            <Text style={[styles.shortBio, { color: textColor }]}>{bio}</Text>
          ) : (
            <View style={{ paddingVertical: 10, alignItems: 'center' }}>
              <Text
                style={{
                  color: isDark ? '#aaa' : '#666',
                  fontSize: 13,
                }}
              >
                No Bio added yet
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Experience */}
      {!isBlocked && (
        <View
          style={[
            styles.infoCard,
            { backgroundColor: isDark ? '#1a1a1a' : themeColors.white },
          ]}
        >
          {/* 🔹 Header */}
          <View style={styles.cardHeader}>
            <View style={styles.headerLeft}>
              <Bag size={18} color={iconColor} />
              <Text style={[styles.bioLabel, { color: textColor }]}>
                Experience
              </Text>
            </View>

            {isOwnProfile && (
              <TouchableOpacity onPress={onEditExperience}>
                <Pen size={16} color={iconColor} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.dividerLine} />

          {/* 🔥 CONDITION */}
          {experiences?.length > 0 ? (
            experiences.map((item: any, index) => (
              <View key={index}>
                <View style={styles.expItem}>
                  <Text style={[styles.logoText, { color: textColor }]}>
                    {index + 1}.
                  </Text>

                  <View style={styles.expContent}>
                    <Text style={[styles.expRole, { color: textColor }]}>
                      {item?.role}
                    </Text>

                    <Text style={styles.expDuration}>{item?.experience}</Text>

                    {item?.description ? (
                      <Text
                        style={[styles.expDesc, { color: textColor }]}
                        numberOfLines={2}
                        ellipsizeMode="tail"
                      >
                        {item?.description}
                      </Text>
                    ) : null}
                  </View>
                  {isOwnProfile && (
                    <TouchableOpacity
                      onPress={() => handleExpDelete?.(item?.id)}
                      activeOpacity={0.7}
                      style={{
                        backgroundColor: themeColors.card2,
                        padding: 6,
                        borderRadius: 100,
                        height: 30,
                      }}
                    >
                      <Trash color={themeColors.red} />
                    </TouchableOpacity>
                  )}
                </View>

                {index !== experiences.length - 1 && (
                  <View style={styles.dividerLine} />
                )}
              </View>
            ))
          ) : (
            <View style={{ paddingVertical: 10, alignItems: 'center' }}>
              <Text
                style={{
                  color: isDark ? '#aaa' : '#666',
                  fontSize: 13,
                }}
              >
                No experience added
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Online Prefrence */}
      {!isBlocked && (
        <View
          style={[
            styles.infoCard,
            { backgroundColor: isDark ? '#1a1a1a' : themeColors.white },
          ]}
        >
          {/* 🔹 Header */}
          <View style={styles.cardHeader}>
            <View style={styles.headerLeft}>
              <Link size={18} color={iconColor} />
              <Text style={[styles.bioLabel, { color: textColor }]}>
                Professional Links
              </Text>
            </View>

            {isOwnProfile && (
              <TouchableOpacity onPress={onEditOnlinePrefrence}>
                <Pen size={16} color={iconColor} />
              </TouchableOpacity>
            )}
          </View>
          <Text
            style={{
              fontFamily: Fonts.Regular,
              fontSize: 12,
              color: textColor,
              marginLeft: 28,
            }}
          >
            Manage your showcase and website links
          </Text>

          <View style={styles.dividerLine} />

          {/* 🔥 CONDITION */}
          {onLinePrefrence?.length > 0 ? (
            <>
              {/* WEBSITE LINKS */}
              {onLinePrefrence?.filter(
                (i: any) => i.type?.toUpperCase() !== 'SHOWCASE',
              )?.length > 0 && (
                  <View>
                    <Text
                      style={{
                        color: textColor,
                        fontSize: 12,
                        fontFamily: Fonts.Bold,
                        marginBottom: 10,
                      }}
                    >
                      Websites
                    </Text>

                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 10,
                      }}
                    >
                      {onLinePrefrence
                        ?.filter(
                          (item: any) => item.type?.toUpperCase() !== 'SHOWCASE',
                        )
                        ?.map((item: any, index) => {
                          const icon = usesocialIcon({
                            type: item.type,
                            size: 18,
                            color: themeColors.white,
                          });

                          return (
                            <TouchableOpacity
                              key={index}
                              onPress={async () => {
                                try {
                                  let url = item?.link?.trim();

                                  if (
                                    !url.startsWith('http://') &&
                                    !url.startsWith('https://')
                                  ) {
                                    url = `https://${url}`;
                                  }

                                  const supported = await Linking.canOpenURL(url);

                                  if (supported) {
                                    await Linking.openURL(url);
                                  }
                                } catch (error) {
                                  console.log('OPEN URL ERROR:', error);
                                }
                              }}
                              activeOpacity={0.8}
                              style={{
                                width: 30,
                                height: 30,
                                borderRadius: 100,
                                backgroundColor: themeColors.primary,
                                justifyContent: 'center',
                                alignItems: 'center',
                              }}
                            >
                              {icon}
                            </TouchableOpacity>
                          );
                        })}
                    </View>
                  </View>
                )}

              {/* SHOWCASE */}
              {!!onLinePrefrence?.filter(
                (i: any) => i.type?.toLowerCase() === 'showcase',
              )?.length && (
                  <View style={{ marginTop: 12 }}>
                    <Text
                      style={{
                        color: textColor,
                        fontSize: 12,
                        fontFamily: Fonts.Bold,
                        marginBottom: 10,
                      }}
                    >
                      Showcase
                    </Text>

                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 10,
                      }}
                    >
                      {onLinePrefrence
                        ?.filter(
                          (item: any) => item.type?.toLowerCase() === 'showcase',
                        )
                        ?.map((item: any, index) => {
                          const icon = usesocialIcon({
                            type: item.type,
                            size: 18,
                            color: themeColors.white,
                          });

                          return (
                            <TouchableOpacity
                              key={index}
                              onPress={async () => {
                                try {
                                  let url = item?.link?.trim();

                                  if (
                                    !url.startsWith('http://') &&
                                    !url.startsWith('https://')
                                  ) {
                                    url = `https://${url}`;
                                  }

                                  const supported = await Linking.canOpenURL(url);

                                  if (supported) {
                                    await Linking.openURL(url);
                                  }
                                } catch (error) {
                                  console.log('OPEN URL ERROR:', error);
                                }
                              }}
                              activeOpacity={0.8}
                              style={{
                                width: 30,
                                height: 30,
                                borderRadius: 100,
                                backgroundColor: themeColors.primary,
                                justifyContent: 'center',
                                alignItems: 'center',
                              }}
                            >
                              {icon}
                            </TouchableOpacity>
                          );
                        })}
                    </View>
                  </View>
                )}
            </>
          ) : (
            <View style={{ paddingVertical: 10, alignItems: 'center' }}>
              <Text
                style={{
                  color: isDark ? '#aaa' : '#666',
                  fontSize: 13,
                }}
              >
                No professional links added
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default ProfileHeader;

const InfoItem = ({ icon, text }: any) => {
  const isDark = true;

  const textColor = isDark ? themeColors.slate : themeColors.black;
  const iconColor = isDark ? '#ccc' : '#555';

  return (
    <View style={styles.infoBox}>
      {/* clone icon with color */}
      {React.cloneElement(icon, {
        color: iconColor,
        size: 16,
      })}

      <Text
        style={[styles.infoText, { color: textColor }]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    height: 120,
  },

  bannerWrapper: {
    position: 'relative',
  },

  bannerLoader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },

  editIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    height: 32,
    width: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  editIconTwo: {
    position: 'absolute',
    bottom: 5,
    right: -2,
    height: 28,
    width: 28,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  avatarWrapper: {
    marginTop: -40,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    position: 'relative',
  },

  avatarContainer: {
    position: 'relative',
  },

  avatarLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: '#fff',
    position: 'relative',
  },

  collabBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 85,
    height: 85,
    borderRadius: 100,
  },

  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },

  name: {
    fontSize: 20,
    fontFamily: Fonts.Bold,
    flexShrink: 1,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    // marginTop: 6,
  },

  metaItem: {
    flexDirection: 'row',
    gap: 5,
  },

  metaText: {
    fontSize: 12,
  },

  shareBtn: {
    padding: 6,
    borderRadius: 100,
  },

  editBtn: {
    padding: 6,
    borderRadius: 20,
    marginTop: 6,
  },

  followCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 6,
    borderRadius: 10,
    marginHorizontal: 10,
  },

  followItem: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },

  followCount: {
    fontSize: 16,
    fontFamily: Fonts.Bold,
  },

  followLabel: {
    fontSize: 11,
    fontFamily: Fonts.Medium,
  },

  divider: {
    width: 1,
    height: 20,
    backgroundColor: '#ccc',
  },

  descContainer: {
    marginTop: 10,
  },
  heading: {
    fontSize: 14,
    fontFamily: Fonts.Bold,
  },
  desc: {
    fontSize: 14,
    fontFamily: Fonts.Regular,
  },

  btnWraper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 13,
    gap: 10,
    paddingHorizontal: 12,
  },

  primaryBtn: {
    backgroundColor: themeColors.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  primaryText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: Fonts.Bold,
  },

  secondaryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  secondaryText: {
    color: '#000',
    fontSize: 13,
    fontFamily: Fonts.Medium,
  },

  infoCard: {
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 10,
    padding: 14,
  },

  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  infoBox: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  infoText: {
    marginLeft: 8,
    fontSize: 12,
    fontFamily: Fonts.Medium,
    flexShrink: 1,
    textTransform: "capitalize"
  },

  dividerLine: {
    height: 1,
    backgroundColor: '#ccc',
    opacity: 0.3,
    marginVertical: 6,
  },

  bioLabel: {
    fontFamily: Fonts.Bold,
    fontSize: 15,
  },

  shortBio: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
  },

  roleContainer: {
    marginBottom: 10,
  },

  rolesLabel: {
    fontSize: 12,
    fontFamily: Fonts.Medium,
    marginBottom: 4,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  expItem: {
    flexDirection: 'row',
    marginTop: 12,
  },

  expLogo: {
    width: 45,
    height: 45,
    borderRadius: 10,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  logoText: {
    fontFamily: Fonts.Bold,
    fontSize: 14,
    marginRight: 10,
  },

  expContent: {
    flex: 1,
  },

  expRole: {
    fontSize: 14,
    fontFamily: Fonts.Bold,
    textTransform: "capitalize"
  },

  expCompany: {
    fontSize: 13,
    opacity: 0.7,
    marginTop: 2,
  },

  expDuration: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },

  expDesc: {
    fontSize: 10,
    lineHeight: 18,
    opacity: 0.85,
  },

  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  cardWrapper: {
    width: '31%',
    marginBottom: 10,
  },

  achievmentCard: {
    padding: 6,
    borderRadius: 10,
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  achievmentTxt: {
    fontSize: 9,
    fontFamily: Fonts.Bold,
    paddingHorizontal: 10,
    paddingVertical: 1,
    borderRadius: 4,
  },

  // ACTIONS
  actions: {
    flexDirection: 'row',
    gap: 8,
  },

  iconBtn: {
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  declineBtn: {
    borderWidth: 1,
    paddingVertical: 5,
    borderColor: '#ef4444',
  },

  acceptBtn: {
    borderWidth: 1,
    paddingVertical: 5,
    borderColor: '#22c55e',
  },

  btnText: {
    fontSize: 12,
    fontFamily: Fonts.Medium,
  },

  messageIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: themeColors.gray,
    marginLeft: 10,
  },
});
