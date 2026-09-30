import { AnimationObject } from 'lottie-react-native';
import { themeColors } from '../theme/colors';
import { ColorValue, ImageSourcePropType } from 'react-native';

export interface OnboardingData {
  id: number;
  animation: ImageSourcePropType;
  text: string;
  textColor: ColorValue;
  backgroundColor: ColorValue;
}

const data: OnboardingData[] = [
  {
    id: 1,
    animation: require('../assets/images/onBoarding6.png'),
    text: 'Connect with professionals and grow your network by discovering people who share your interests.',
    textColor: themeColors.primary,
    backgroundColor: '#F1F5F9', // light background
  },
  {
    id: 2,
    animation: require('../assets/images/onBoarding5.png'),
    text: 'Showcase your skills, interests, and profile to build meaningful professional relationships.',
    textColor: '#FFFFFF',
    backgroundColor: themeColors.primary, // primary brand color
  },
  {
    id: 3,
    animation: require('../assets/images/onBoarding4.png'),
    text: 'Discover new opportunities, collaborate with others, and grow within a powerful community.',
    textColor: '#FFFFFF',
    backgroundColor: '#0F172A', // dark contrast background
  },
];

export default data;

export const mockNews = [
  {
    id: 'n1',
    name: 'TechCrunch',
    avatar: 'https://i.pravatar.cc/150?img=12',
    time: '2h ago',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995',
    title: 'AI is Transforming the Future of Work',
    description: 'Artificial Intelligence is rapidly changing industries...',
  },
  {
    id: 'n2',
    name: 'BBC News',
    avatar: 'https://i.pravatar.cc/150?img=32',
    time: '4h ago',
    image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c',
    title: 'Global Markets See Unexpected Growth',
    description: 'Stock markets around the world...',
  },
];

export const BookData = [
  {
    id: '1',
    title: 'Atomic Habits',
    author: 'James Clear',
    type: 'Thriller',
    image: 'https://images-na.ssl-images-amazon.com/images/I/81wgcld4wxL.jpg',
    publishedDate: '23-Jan-2021',
  },
  {
    id: '2',
    title: 'Deep Work',
    author: 'Cal Newport',
    type: 'Action',
    image: 'https://images-na.ssl-images-amazon.com/images/I/71QKQ9mwV7L.jpg',
    publishedDate: '23-Jan-2021',
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
  },
  {
    id: '3',
    title: 'Rich Dad Poor Dad',
    author: 'Robert Kiyosaki',
    type: 'Comedy',
    image: 'https://images-na.ssl-images-amazon.com/images/I/81bsw6fnUiL.jpg',
    publishedDate: '23-Jan-2021',
  },
  {
    id: '4',
    title: 'The Psychology of Money',
    author: 'Morgan Housel',
    type: 'Drama',
    image: 'https://images-na.ssl-images-amazon.com/images/I/71g2ednj0JL.jpg',
    publishedDate: '23-Jan-2021',
  },
  {
    id: '5',
    title: 'Think and Grow Rich',
    author: 'Napoleon Hill',
    type: 'Social',
    image: 'https://images-na.ssl-images-amazon.com/images/I/71UypkUjStL.jpg',
    publishedDate: '23-Jan-2021',
  },
];

/* ---------------- RANDOM IMAGES ---------------- */

const randomImages = [
  'https://picsum.photos/500/500?random=1',
  'https://picsum.photos/500/500?random=2',
  'https://picsum.photos/500/500?random=3',
  'https://picsum.photos/500/500?random=4',
  'https://picsum.photos/500/500?random=5',
  'https://picsum.photos/500/500?random=6',
];

/* ---------------- CAPTIONS ---------------- */

const captions = [
  'Amazing day outside 🌞',
  'Working on something exciting 🚀',
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.',
  'Coffee and coding ☕',
  'Nature is beautiful 🌿',
  'Never stop learning 📚',
];

const TAGS = [
  'Motivation',
  'Life',
  'Coding',
  'Fitness',
  'Startup',
  'Travel',
  'Nature',
  'Food',
  'Design',
  'Productivity',
  'AI',
  'Tech',
];

/* ---------------- RANDOM USER ---------------- */
const realNames = [
  'Aarav Sharma',
  'Ananya Reddy',
  'Rohan Mehta',
  'Priya Verma',
  'Karthik Iyer',
  'Sneha Kapoor',
  'Rahul Das',
  'Neha Roy',
  'Aditya Singh',
  'Meera Nair',
  'Arjun Patel',
  'Ishita Gupta',
  'Vikram Joshi',
  'Pooja Mishra',
  'Siddharth Jain',
  'Kavya Nair',
  'Ritika Sharma',
  'Aman Verma',
  'Tanvi Kulkarni',
  'Harsh Agarwal',

  // 🌍 global mix
  'Liam Johnson',
  'Olivia Brown',
  'Noah Williams',
  'Emma Davis',
  'James Miller',
  'Sophia Wilson',
  'Benjamin Moore',
  'Isabella Taylor',
];

const randomUser = (i: number) => {
  const fullName = realNames[Math.floor(Math.random() * realNames.length)];

  const username =
    fullName.toLowerCase().replace(/\s/g, '') + Math.floor(Math.random() * 100);

  return {
    userName: fullName, // display name
    userHandle: username, // @username
    userAvatar: `https://i.pravatar.cc/150?img=${(i % 70) + 1}`,
  };
};

/* ---------------- MEDIA GENERATOR ---------------- */
/**
 * Distribution:
 * 30% → text only
 * 40% → single image
 * 30% → multiple images (2–4)
 */

const createMedia = () => {
  const rand = Math.random();

  // ✅ TEXT ONLY
  if (rand < 0.3) return [];

  // ✅ SINGLE IMAGE
  if (rand < 0.7) {
    return [
      {
        type: 'image',
        url: randomImages[Math.floor(Math.random() * randomImages.length)],
      },
    ];
  }

  // ✅ MULTIPLE IMAGES (2–4)
  const count = Math.floor(Math.random() * 3) + 2; // 2 to 4

  return Array.from({ length: count }).map(() => ({
    type: 'image',
    url: randomImages[Math.floor(Math.random() * randomImages.length)],
  }));
};

/* ---------------- POST GENERATOR ---------------- */

const createBookPost = (i: number) => {
  const user = randomUser(i);
  const book = BookData[Math.floor(Math.random() * BookData.length)];

  return {
    id: `book-${i}`,
    ...user,
    time: `${Math.floor(Math.random() * 12) + 1}h ago`,

    caption: `📚 Just finished reading "${book.title}" — highly recommended!`,

    media: [
      {
        type: 'image',
        url: book.image, // ✅ book cover
      },
    ],

    comments: Math.floor(Math.random() * 500),

    tags: [book.type, 'Books'],

    // 🔥 IMPORTANT
    postType: 'book',
    bookData: book,
  };
};

export const generateFeedPosts = (count = 50) => {
  return Array.from({ length: count }).map((_, i) => {
    const isBookPost = Math.random() < 0.2; // 👉 20% books

    if (isBookPost) {
      return createBookPost(i); // ✅ inject book
    }

    const user = randomUser(i);

    return {
      id: `feed-${i}`,
      ...user,
      time: `${Math.floor(Math.random() * 12) + 1}h ago`,

      media: createMedia(),
      comments: Math.floor(Math.random() * 1000),

      caption: captions[Math.floor(Math.random() * captions.length)],
      tags: getRandomTags(),

      postType: 'normal', // ✅ explicitly normal
    };
  });
};

const getRandomTags = () => {
  const shouldHaveTags = Math.random() > 0.5; // 👉 50% posts have tags

  if (!shouldHaveTags) return []; // ❌ no tags

  const count = Math.floor(Math.random() * 3) + 1; // 1–3 tags
  const shuffled = [...TAGS].sort(() => 0.5 - Math.random());

  return shuffled.slice(0, count);
};

/* ---------------- EXPORT DATA ---------------- */

export const feedPosts = generateFeedPosts(1000);
export const newsPosts = generateFeedPosts(20);
export const contestPosts = generateFeedPosts(20);

type Notification = {
  id: string;
  user: string;
  message: string;
  time: string;
  avatar: string;
  type: 'request' | 'like' | 'comment' | 'follow';
  unread?: boolean;
};

export const requestNotifications: Notification[] = [
  {
    id: '1',
    user: 'Alex',
    message: 'sent you a connection request',
    time: '2m',
    avatar: 'https://i.pravatar.cc/150?img=11',
    type: 'request',
  },
  {
    id: '2',
    user: 'Emma',
    message: 'sent you a connection request',
    time: '10m',
    avatar: 'https://i.pravatar.cc/150?img=12',
    type: 'request',
  },
];

export const todayNotifications: Notification[] = [
  {
    id: '3',
    user: 'John',
    message: 'liked your post',
    time: '5m',
    avatar: 'https://i.pravatar.cc/150?img=1',
    type: 'like',
    unread: true,
  },
  {
    id: '4',
    user: 'Emily',
    message: 'started following you',
    time: '20m',
    avatar: 'https://i.pravatar.cc/150?img=5',
    type: 'follow',
  },
  {
    id: '5',
    user: 'Michael',
    message: 'commented on your photo',
    time: '1h',
    avatar: 'https://i.pravatar.cc/150?img=3',
    type: 'comment',
  },
];

export const mockUsers = [
  {
    id: 51975,
    name: 'Rahul Sharma',
    user_name: 'veky123',
    role: 'Software Engineer',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    mutual: 12,
    isPrivate: false,
    phone: '9692152143',

    email: 'rahul@gmail.com',
    location: 'Hyderabad, India',
    joined: 'Jan 2024',

    bio: 'Passionate React Native developer building scalable mobile apps.',

    primaryRoles: ['Developer', 'Writer'],
    secondaryRoles: ['Designer', 'Mentor'],

    experiences: [
      {
        id: 'exp1',
        role: 'React Native Developer',
        company: 'Tech Company',
        type: 'Full-time',
        start: 'Jan 2024',
        end: 'Present',
        description: 'Building scalable mobile apps using React Native.',
      },
      {
        id: 'exp2',
        role: 'Frontend Developer',
        company: 'Startup',
        type: 'Internship',
        start: 'Jan 2023',
        end: 'Dec 2023',
        description: 'Worked on UI and performance optimization.',
      },
    ],
    achievements: [
      {
        id: 'a1',
        title: 'Short Film Grand Event',
        color: '#3B82F6',
      },
      {
        id: 'a2',
        title: 'Audience Choice',
        color: '#22C55E',
      },
    ],
  },
  {
    id: 51976,
    name: 'Rahul Sharma',
    user_name: 'vinod1',
    role: 'Software Engineer',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    mutual: 12,
    isPrivate: false,
    phone: '9692152143',

    email: 'rahul@gmail.com',
    location: 'Hyderabad, India',
    joined: 'Jan 2024',

    bio: 'Passionate React Native developer building scalable mobile apps.',

    primaryRoles: ['Developer', 'Writer'],
    secondaryRoles: ['Designer', 'Mentor'],

    experiences: [
      {
        id: 'exp1',
        role: 'React Native Developer',
        company: 'Tech Company',
        type: 'Full-time',
        start: 'Jan 2024',
        end: 'Present',
        description: 'Building scalable mobile apps using React Native.',
      },
      {
        id: 'exp2',
        role: 'Frontend Developer',
        company: 'Startup',
        type: 'Internship',
        start: 'Jan 2023',
        end: 'Dec 2023',
        description: 'Worked on UI and performance optimization.',
      },
    ],
    achievements: [
      {
        id: 'a1',
        title: 'Short Film Grand Event',
        color: '#3B82F6',
      },
      {
        id: 'a2',
        title: 'Audience Choice',
        color: '#22C55E',
      },
    ],
  },
];

export const connectionsMockData = [
  // Followers
  {
    id: '1',
    name: 'Rahul Sharma',
    avatar: 'https://i.pravatar.cc/150?img=1',
    role: 'Frontend Developer',
    relation: 'follower',
  },
  {
    id: '2',
    name: 'Priya Verma',
    avatar: 'https://i.pravatar.cc/150?img=5',
    role: 'UI/UX Designer',
    relation: 'follower',
  },

  // Following
  {
    id: '3',
    name: 'Sneha Reddy',
    avatar: 'https://i.pravatar.cc/150?img=12',
    role: 'Product Manager',
    relation: 'following',
  },
  {
    id: '4',
    name: 'Arjun Mehta',
    avatar: 'https://i.pravatar.cc/150?img=15',
    role: 'Startup Founder',
    relation: 'following',
  },

  // Connections
  {
    id: '5',
    name: 'Vikram Singh',
    avatar: 'https://i.pravatar.cc/150?img=25',
    role: 'Full Stack Developer',
    relation: 'connection',
  },
  {
    id: '6',
    name: 'Ananya Das',
    avatar: 'https://i.pravatar.cc/150?img=30',
    role: 'Data Scientist',
    relation: 'connection',
  },
];

export const dummyFollowers = [
  {
    id: 1,
    name: 'Priya Sharma',
    avatar: 'https://i.pravatar.cc/150?u=priya',
    role: 'Frontend Developer',
    followsYou: true,
    followedByYou: false,
  },
  {
    id: 2,
    name: 'Rahul Verma',
    avatar: 'https://i.pravatar.cc/150?u=rahul',
    role: 'UI/UX Designer',
    followsYou: true,
    followedByYou: true,
  },
  {
    id: 3,
    name: 'Ananya Rao',
    avatar: 'https://i.pravatar.cc/150?u=ananya',
    role: 'Product Designer',
    followsYou: false,
    followedByYou: true,
  },
];

export const movies = [
  {
    id: '1',
    title: 'Salaar',
    description:
      'A high-octane action drama about friendship, power, and revenge set in a violent world.',
    rating: 4.7,
    image:
      'https://mir-s3-cdn-cf.behance.net/project_modules/1400_webp/4762e1118501859.608a514e39fa0.png',

    reviews: [
      {
        id: 'r1',
        name: 'Rahul Mehta',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        rating: 4.9,
        comment: 'Mass movie! Prabhas entry gave goosebumps 🔥',
        likes: 210,
      },
      {
        id: 'r2',
        name: 'Sneha Kapoor',
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
        rating: 4.6,
        comment: 'Action and BGM are next level!',
        likes: 150,
      },
    ],
  },

  {
    id: '2',
    title: 'Dasara',
    description:
      'A raw and rustic story set in a coal mining village, filled with intense emotions and action.',
    rating: 4.3,
    image:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKu3lZIXBEKoeORPzl2lyRQLeqp3ZumsJj_g&s',

    reviews: [
      {
        id: 'r3',
        name: 'Amit Sharma',
        avatar: 'https://randomuser.me/api/portraits/men/11.jpg',
        rating: 4.5,
        comment: 'Nani acting was outstanding!',
        likes: 120,
      },
      {
        id: 'r4',
        name: 'Priya Reddy',
        avatar: 'https://randomuser.me/api/portraits/women/21.jpg',
        rating: 4.2,
        comment: 'Raw and emotional storytelling ❤️',
        likes: 98,
      },
    ],
  },

  {
    id: '3',
    title: 'Majili',
    description:
      'A romantic drama that explores love, heartbreak, and second chances in life.',
    rating: 4.1,
    image:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSeKfTpHyYiZcCrpzIlzXUAe85Slt48pEyVUQ&s',

    reviews: [
      {
        id: 'r5',
        name: 'Kiran Kumar',
        avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
        rating: 4.3,
        comment: 'Emotional rollercoaster 💔',
        likes: 80,
      },
    ],
  },

  {
    id: '4',
    title: 'Rangasthalam',
    description:
      'A period action drama set in the 1980s rural India highlighting social injustice and rebellion.',
    rating: 4.8,
    image:
      'https://c8.alamy.com/comp/MBEXFM/rangasthalam-indian-poster-with-title-in-telugu-ram-charan-2018-konidela-production-companycourtesy-everett-collection-MBEXFM.jpg',

    reviews: [
      {
        id: 'r6',
        name: 'Vikram Singh',
        avatar: 'https://randomuser.me/api/portraits/men/18.jpg',
        rating: 5.0,
        comment: 'Masterpiece! Ram Charan performance 🔥',
        likes: 300,
      },
      {
        id: 'r7',
        name: 'Anjali',
        avatar: 'https://randomuser.me/api/portraits/women/36.jpg',
        rating: 4.7,
        comment: 'Village setup and music are perfect!',
        likes: 170,
      },
    ],
  },

  {
    id: '5',
    title: 'V',
    description:
      'A thrilling cat-and-mouse chase between a serial killer and a determined cop.',
    rating: 4.0,
    image: 'https://wallpapercave.com/wp/wp6908040.jpg',

    reviews: [
      {
        id: 'r8',
        name: 'Rohit Verma',
        avatar: 'https://randomuser.me/api/portraits/men/50.jpg',
        rating: 4.1,
        comment: 'Interesting concept but slow pacing.',
        likes: 60,
      },
    ],
  },

  {
    id: '6',
    title: 'A Aa',
    description:
      'A light-hearted romantic entertainer filled with humor, family emotions, and love.',
    rating: 4.2,
    image:
      'https://teluguone.com/photos/uploadsExt/uploads/A%20Aa%20Movie%20Wallpapers/A%20Aa%20Movie%20Posters/A_Aa_Movie_Posters1_small.jpg',

    reviews: [
      {
        id: 'r9',
        name: 'Neha Roy',
        avatar: 'https://randomuser.me/api/portraits/women/30.jpg',
        rating: 4.4,
        comment: 'Feel-good movie 😍 loved it!',
        likes: 140,
      },
    ],
  },
];

export const opportunities = [
  {
    id: '1',
    userName: 'Rahul Sharma',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    status: 'Hiring Now',
    poster: 'https://images.unsplash.com/photo-1551434678-e076c223a692',
    title: 'React Native Developer',
    category: 'Software Development',
    location: 'Hyderabad, India',
    workType: 'Onsite',
    description:
      'Looking for a skilled React Native developer to build scalable mobile applications with strong UI/UX understanding.',
    salary: '₹6 - 12 LPA',
  },
  {
    id: '2',
    userName: 'Priya Verma',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    status: 'Urgent Hiring',
    poster: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d',
    title: 'UI/UX Designer',
    category: 'Design',
    location: 'Bangalore, India',
    workType: 'Remote',
    description:
      'We need a creative UI/UX designer who can craft modern and intuitive user experiences for mobile and web.',
    salary: '₹5 - 10 LPA',
  },
  {
    id: '3',
    userName: 'Amit Patel',
    avatar: 'https://randomuser.me/api/portraits/men/12.jpg',
    status: 'Actively Hiring',
    poster: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d',
    title: 'Backend Developer (Node.js)',
    category: 'Software Development',
    location: 'Pune, India',
    workType: 'Remote',
    description:
      'Seeking backend developer with Node.js and MongoDB experience to build high-performance APIs.',
    salary: '₹8 - 15 LPA',
  },
  {
    id: '4',
    userName: 'Sneha Reddy',
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
    status: 'New Opening',
    poster: 'https://images.unsplash.com/photo-1492724441997-5dc865305da7',
    title: 'Digital Marketing Specialist',
    category: 'Marketing',
    location: 'Hyderabad, India',
    workType: 'Onsite',
    description:
      'Looking for a marketing expert skilled in SEO, social media, and paid campaigns to grow brand visibility.',
    salary: '₹4 - 8 LPA',
  },
  {
    id: '5',
    userName: 'Vikram Singh',
    avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
    status: 'Hiring Interns',
    poster: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c',
    title: 'Frontend Developer Intern',
    category: 'Internship',
    location: 'Delhi, India',
    workType: 'Remote',
    description:
      'Great opportunity for students to work on real-world frontend projects using React and modern UI libraries.',
    salary: '₹10K - ₹25K / month',
  },
  {
    id: '6',
    userName: 'Neha Kapoor',
    avatar: 'https://randomuser.me/api/portraits/women/22.jpg',
    status: 'Closed Soon',
    poster: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4',
    title: 'Product Manager',
    category: 'Product',
    location: 'Mumbai, India',
    workType: 'Onsite',
    description:
      'Looking for a product manager to lead cross-functional teams and deliver impactful digital products.',
    salary: '₹12 - 25 LPA',
  },
];

export const participant = [
  {
    id: '1',
    name: 'Aarav Sharma',
    userIcon: 'https://randomuser.me/api/portraits/men/32.jpg',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    poster: 'https://picsum.photos/400/600?random=1',
    video: 'https://www.w3schools.com/html/mov_bbb.mp4',
    postedOn: '22 Mar 2026',

    title: 'The Last Stand',
    description:
      'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.',

    genre: 'Action',
    rating: 4.5,

    stats: {
      likes: 1240,
      views: 18230,
    },
  },
  {
    id: '2',
    name: 'Iva Kapoor',
    userIcon: 'https://randomuser.me/api/portraits/women/44.jpg',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    poster: 'https://picsum.photos/400/600?random=2',
    video: 'https://www.w3schools.com/html/movie.mp4',
    postedOn: '01 Jan 2026',

    title: 'Broken Silence',
    description:
      'An emotional drama uncovering hidden truths and the power of forgiveness.',

    genre: 'Drama',
    rating: 4.8,

    stats: {
      likes: 2230,
      views: 30210,
    },
  },
  {
    id: '3',
    name: 'Rohan Verma',
    userIcon: 'https://randomuser.me/api/portraits/men/65.jpg',
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
    poster: 'https://picsum.photos/400/600?random=3',
    video: 'https://www.w3schools.com/html/mov_bbb.mp4',
    postedOn: '22 Feb 2026',

    title: 'Future 2099',
    description:
      'A sci-fi journey into a futuristic world where AI controls human destiny.',

    genre: 'Sci-Fi',
    rating: 4.2,

    stats: {
      likes: 980,
      views: 14500,
    },
  },
];

export const sysnopsisData = [
  {
    id: '1',
    title: 'Atomic Habits',
    author: 'James Clear',
    type: 'Thriller',
    image: 'https://images-na.ssl-images-amazon.com/images/I/81wgcld4wxL.jpg',
  },
  {
    id: '2',
    title: 'Deep Work',
    author: 'Cal Newport',
    type: 'Action',
    image: 'https://images-na.ssl-images-amazon.com/images/I/71QKQ9mwV7L.jpg',
  },
  {
    id: '3',
    title: 'Rich Dad Poor Dad',
    author: 'Robert Kiyosaki',
    type: 'Comedy',
    image: 'https://images-na.ssl-images-amazon.com/images/I/81bsw6fnUiL.jpg',
  },
  {
    id: '4',
    title: 'The Psychology of Money',
    author: 'Morgan Housel',
    type: 'Drama',
    image: 'https://images-na.ssl-images-amazon.com/images/I/71g2ednj0JL.jpg',
  },
  {
    id: '5',
    title: 'Think and Grow Rich',
    author: 'Napoleon Hill',
    type: 'Social',
    image: 'https://images-na.ssl-images-amazon.com/images/I/71UypkUjStL.jpg',
  },
];

export const contests = [
  {
    id: '1',
    title: 'Action Short Film Challenge',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995',

    date: '20 Sep 2025',
    participants: '3', // 👈 for UI
    participantsCount: 3,

    description:
      'Create a high-impact action short film with engaging storytelling and dynamic visuals.',

    contestType: 'Short Film',
    contestFor: 'Director',
    genre: 'Action',

    startDate: '18 Sep 2026',
    endDate: 'Ends in 3 days',

    status: 'active',

    avatars: [
      'https://randomuser.me/api/portraits/men/1.jpg',
      'https://randomuser.me/api/portraits/women/44.jpg',
      'https://randomuser.me/api/portraits/men/3.jpg',
    ],

    participantsData: [
      {
        id: '1',
        name: 'Aarav Sharma',
        avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
        poster: 'https://picsum.photos/400/600?random=1',
        video: 'https://www.w3schools.com/html/mov_bbb.mp4',
        rating: 4.5,

        title: 'The Last Stand',
        description:
          'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.',
        postedOn: '22 Mar 2026',
        genre: 'Action',
        stats: { likes: 1240, views: 18230 },
      },
      {
        id: '2',
        name: 'Iva Kapoor',
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
        poster: 'https://picsum.photos/400/600?random=2',
        video: 'https://www.w3schools.com/html/movie.mp4',
        title: 'Broken Silence',
        description:
          'An emotional drama uncovering hidden truths and the power of forgiveness.',

        genre: 'Drama',
        postedOn: '01 Jan 2026',
        rating: 4.8,
        stats: { likes: 2230, views: 30210 },
      },
      {
        id: '3',
        name: 'Rohan Verma',
        avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
        poster: 'https://picsum.photos/400/600?random=3',
        video: 'https://www.w3schools.com/html/mov_bbb.mp4',
        postedOn: '22 Feb 2026',
        genre: 'Thriller',
        title: 'Future 2099',
        description:
          'A sci-fi journey into a futuristic world where AI controls human destiny.',
        rating: 4.2,
        stats: { likes: 980, views: 14500 },
      },
    ],
  },

  {
    id: '2',
    title: 'Drama Screenplay Writing Contest',
    image: 'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d',

    date: '5 Sep 2025',
    participants: '2',
    participantsCount: 2,

    description:
      'Write a compelling drama screenplay with emotional depth and strong dialogue.',

    contestType: 'Screenplay',
    contestFor: 'Writer',
    genre: 'Drama',

    startDate: '20 Sep 2025',
    endDate: '25 Sep 2025',

    status: 'completed',

    avatars: [
      'https://randomuser.me/api/portraits/women/21.jpg',
      'https://randomuser.me/api/portraits/men/45.jpg',
    ],

    participantsData: [
      {
        id: '4',
        name: 'Ananya Das',
        avatar: 'https://randomuser.me/api/portraits/women/21.jpg',
        poster: 'https://picsum.photos/400/600?random=4',
        title: 'Silent Tears',
        rating: 4.9,
        stats: { likes: 3200, views: 40210 },
        video: 'https://youtu.be/iAtoZar5W58?si=o8RNOvmuQ-QVLacQ',
        postedOn: '22 Feb 2026',
        genre: 'Drama',
        description:
          'A sci-fi journey into a futuristic world where AI controls human destiny.',
      },
      {
        id: '5',
        name: 'Rahul Mehta',
        avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
        poster: 'https://picsum.photos/400/600?random=5',
        title: 'Lost Within',
        rating: 4.6,
        genre: 'Action',
        stats: { likes: 2100, views: 29800 },
        video: 'https://www.w3schools.com/html/mov_bbb.mp4',
        postedOn: '22 Feb 2026',

        description:
          'A sci-fi journey into a futuristic world where AI controls human destiny.',
      },
    ],

    winner: {
      id: '4',
      name: 'Ananya Das',
      avatar: 'https://randomuser.me/api/portraits/women/21.jpg',
      title: 'Silent Tears',
      rating: 4.9,
    },
  },

  {
    id: '3',
    title: 'Cinematic Photography Contest',
    image: 'https://images.unsplash.com/photo-1556761175-4b46a572b786',
    participants: '2',
    participantsCount: 2,

    description:
      'Capture powerful cinematic shots with strong composition and lighting.',

    contestType: 'Photography',
    contestFor: 'Cinematographer',
    genre: 'Action',

    startDate: '25 Sep 2026',
    endDate: '02 Oct 2026',

    status: 'completed',

    avatars: [
      'https://randomuser.me/api/portraits/men/18.jpg',
      'https://randomuser.me/api/portraits/women/36.jpg',
    ],

    participantsData: [
      {
        id: '6',
        name: 'Vikram Singh',
        avatar: 'https://randomuser.me/api/portraits/men/18.jpg',
        poster: 'https://picsum.photos/400/600?random=6',
        title: 'Shadow Light',
        rating: 4.7,
        stats: { likes: 1800, views: 22000 },
        video: 'https://www.w3schools.com/html/mov_bbb.mp4',
        postedOn: '22 Feb 2026',
        description:
          'A sci-fi journey into a futuristic world where AI controls human destiny.',
      },
      {
        id: '7',
        name: 'Neha Roy',
        avatar: 'https://randomuser.me/api/portraits/women/36.jpg',
        poster: 'https://picsum.photos/400/600?random=7',
        title: 'Urban Frames',
        rating: 4.9,
        stats: { likes: 2500, views: 31000 },
        video: 'https://www.w3schools.com/html/mov_bbb.mp4',
        postedOn: '22 Feb 2026',

        description:
          'A sci-fi journey into a futuristic world where AI controls human destiny.',
      },
    ],

    winner: {
      id: '7',
      name: 'Neha Roy',
      avatar: 'https://randomuser.me/api/portraits/women/36.jpg',
      title: 'Urban Frames',
      rating: 4.9,
    },
  },

  {
    id: '4',
    title: 'Sci-Fi Short Film Battle',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d',
    participants: '4',
    participantsCount: 4,

    description:
      'Create a futuristic sci-fi short film with innovative storytelling and visual effects.',

    contestType: 'Short Film',
    contestFor: 'Director',
    genre: 'Sci-Fi',

    startDate: '05 Oct 2026',
    endDate: '10 Oct 2026',

    status: 'active',

    avatars: [
      'https://randomuser.me/api/portraits/men/11.jpg',
      'https://randomuser.me/api/portraits/women/22.jpg',
      'https://randomuser.me/api/portraits/men/33.jpg',
    ],

    participantsData: [
      {
        id: '8',
        name: 'Kabir Khan',
        avatar: 'https://randomuser.me/api/portraits/men/11.jpg',
        poster: 'https://picsum.photos/400/600?random=8',
        video: 'https://www.w3schools.com/html/mov_bbb.mp4',
        title: 'Galaxy Wars',
        description: 'An interstellar war between humans and AI.',
        postedOn: '01 Oct 2026',
        genre: 'Sci-Fi',
        rating: 4.6,
        stats: { likes: 1800, views: 25000 },
      },
      {
        id: '9',
        name: 'Sara Ali',
        avatar: 'https://randomuser.me/api/portraits/women/22.jpg',
        poster: 'https://picsum.photos/400/600?random=9',
        video: 'https://www.w3schools.com/html/movie.mp4',
        title: 'Time Loop',
        description: 'A mysterious time loop traps a scientist.',
        postedOn: '02 Oct 2026',
        genre: 'Sci-Fi',
        rating: 4.8,
        stats: { likes: 2300, views: 31000 },
      },
    ],
  },

  {
    id: '5',
    title: 'Music Video Creation Contest',
    image: 'https://images.unsplash.com/photo-1511376777868-611b54f68947',
    participants: '5',
    participantsCount: 5,

    description:
      'Create a visually stunning music video synced perfectly with rhythm and emotion.',

    contestType: 'Music Video',
    contestFor: 'Editor',
    genre: 'Music',

    startDate: '12 Oct 2026',
    endDate: '18 Oct 2026',

    status: 'active',

    avatars: [
      'https://randomuser.me/api/portraits/men/51.jpg',
      'https://randomuser.me/api/portraits/women/61.jpg',
      'https://randomuser.me/api/portraits/men/71.jpg',
    ],

    participantsData: [
      {
        id: '10',
        name: 'Arjun Patel',
        avatar: 'https://randomuser.me/api/portraits/men/51.jpg',
        poster: 'https://picsum.photos/400/600?random=10',
        video: 'https://www.w3schools.com/html/mov_bbb.mp4',
        title: 'Rhythm Flow',
        description: 'A high-energy music video with dynamic edits.',
        postedOn: '10 Oct 2026',
        genre: 'Music',
        rating: 4.7,
        stats: { likes: 1500, views: 21000 },
      },
    ],
  },

  {
    id: '6',
    title: 'Comedy Reel Challenge',
    image: 'https://images.unsplash.com/photo-1497032205916-ac775f0649ae',
    participants: '3',
    participantsCount: 3,

    description:
      'Create a short comedy reel that makes people laugh instantly.',

    contestType: 'Reel',
    contestFor: 'Content Creator',
    genre: 'Comedy',

    startDate: '15 Oct 2026',
    endDate: '20 Oct 2026',

    status: 'completed',

    avatars: [
      'https://randomuser.me/api/portraits/men/81.jpg',
      'https://randomuser.me/api/portraits/women/91.jpg',
    ],

    participantsData: [
      {
        id: '11',
        name: 'Ritesh Kumar',
        avatar: 'https://randomuser.me/api/portraits/men/81.jpg',
        poster: 'https://picsum.photos/400/600?random=11',
        video: 'https://www.w3schools.com/html/mov_bbb.mp4',
        title: 'Office Fun',
        description: 'Funny office situations turned into a reel.',
        postedOn: '18 Oct 2026',
        genre: 'Comedy',
        rating: 4.5,
        stats: { likes: 1200, views: 18000 },
      },
    ],

    winner: {
      id: '11',
      name: 'Ritesh Kumar',
      avatar: 'https://randomuser.me/api/portraits/men/81.jpg',
      title: 'Office Fun',
      rating: 4.5,
    },
  },
];

export const VisionXContent = [
  {
    id: 1,
    user: {
      name: 'Naruto Uzumaki',
      userName: 'naruto7',
      profileImage:
        'https://api.dicebear.com/9.x/notionists/png?seed=naruto&backgroundColor=b6e3f4',
      isFollowing: false,
    },
    genre: 'Action',
    image:
      'https://images.pexels.com/photos/36425130/pexels-photo-36425130.jpeg',
    link: 'https://youtu.be/RSZQZDHD0Fs',
    platform: 'youtube',
    title: 'Only 7 users in the Entire Shinobi World!',
    description:
      'Exploring the rarest abilities ever seen in the shinobi world.',
    isLiked: false,
    isSaved: true,
    likes: 120,
    views: 456,
    rating: 4.7,
    myRating: 4,
    date: '2hrs ago',
  },

  {
    id: 2,
    user: {
      name: 'Robo Creator',
      userName: 'botdesign',
      profileImage:
        'https://api.dicebear.com/9.x/notionists/png?seed=robot&backgroundColor=ffd5dc',
      isFollowing: true,
    },
    genre: 'Technology',
    image: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg',
    link: 'https://www.instagram.com/p/DJw7Xg5SGxf/',
    platform: 'instagram',
    title: 'Creative Avatar Design',
    description: 'Generated avatars for your next project.',
    isLiked: true,
    isSaved: true,
    likes: 670,
    views: 3200,
    rating: 4.9,
    myRating: 5,
    date: '8hrs ago',
  },

  {
    id: 3,
    user: {
      name: 'Alex Morgan',
      userName: 'booknerd',
      profileImage:
        'https://api.dicebear.com/9.x/notionists/png?seed=alex&backgroundColor=c0aede',
      isFollowing: false,
    },
    genre: 'Books',
    image: 'https://images.pexels.com/photos/46274/pexels-photo-46274.jpeg',
    link: 'https://youtu.be/vpN-xTkg4m0',
    platform: 'youtube',
    title: 'Book Recommendation',
    description: 'One of the best psychological thrillers you must read.',
    isLiked: false,
    isSaved: true,
    likes: 89,
    views: 300,
    rating: 4.8,
    myRating: 5,
    date: '1 day ago',
  },

  {
    id: 4,
    user: {
      name: 'Sophia Lee',
      userName: 'factzone',
      profileImage:
        'https://api.dicebear.com/9.x/notionists/png?seed=sophia&backgroundColor=d1f4d1',
      isFollowing: true,
    },
    genre: 'Education',
    image: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg',
    link: 'https://youtu.be/b0fPciW_uco',
    platform: 'youtube',
    title: 'Mind Blowing Facts',
    description: 'Facts that will completely change how you see the world.',
    isLiked: true,
    isSaved: true,
    likes: 980,
    views: 5400,
    rating: 4.6,
    myRating: 4,
    date: '3 days ago',
  },

  {
    id: 5,
    user: {
      name: 'Emma Watson',
      userName: 'uidesigns',
      profileImage:
        'https://api.dicebear.com/9.x/notionists/png?seed=emma&backgroundColor=ffe4c4',
      isFollowing: false,
    },
    genre: 'Design',
    image: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg',
    link: 'https://www.instagram.com/reel/DWARG86jPCQ/',
    platform: 'instagram',
    title: 'Minimal Design Inspiration',
    description: 'Clean UI inspirations for modern apps.',
    isLiked: false,
    isSaved: false,
    likes: 210,
    views: 870,
    rating: 4.1,
    myRating: 3,
    date: '6hrs ago',
  },

  {
    id: 6,
    user: {
      name: 'Elon Tech',
      userName: 'futureai',
      profileImage:
        'https://api.dicebear.com/9.x/notionists/png?seed=elon&backgroundColor=f9e4f9',
      isFollowing: true,
    },
    genre: 'Technology',
    image: 'https://images.pexels.com/photos/1671325/pexels-photo-1671325.jpeg',
    link: 'https://youtu.be/3u6k2CZ7rqU',
    platform: 'youtube',
    title: 'Tech Trends 2026',
    description: 'AI and web technologies shaping the future.',
    isLiked: true,
    isSaved: false,
    likes: 430,
    views: 2000,
    rating: 4.7,
    myRating: 5,
    date: '12hrs ago',
  },

  {
    id: 7,
    user: {
      name: 'David Miller',
      userName: 'readmore',
      profileImage:
        'https://api.dicebear.com/9.x/notionists/png?seed=david&backgroundColor=b6e3f4',
      isFollowing: false,
    },
    genre: 'Books',
    image: 'https://images.pexels.com/photos/46274/pexels-photo-46274.jpeg',
    link: 'https://youtube.com/shorts/NkPqV234hlU',
    platform: 'youtube',
    title: 'Top 10 Books to Read',
    description: 'A curated list of must-read books this year.',
    isLiked: false,
    isSaved: true,
    likes: 150,
    views: 900,
    rating: 4.3,
    myRating: 4,
    date: '2 days ago',
  },

  {
    id: 8,
    user: {
      name: 'John Carter',
      userName: 'johnclicks',
      profileImage:
        'https://api.dicebear.com/9.x/notionists/png?seed=john&backgroundColor=ffd5dc',
      isFollowing: true,
    },
    genre: 'Photography',
    image: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg',
    link: 'https://www.instagram.com/reel/DWHkBs6EtV-/',
    platform: 'instagram',
    title: 'Street Photography Vibes',
    description: 'Captured a perfect golden hour moment in the city.',
    isLiked: true,
    isSaved: false,
    likes: 342,
    views: 1200,
    rating: 4.2,
    myRating: 5,
    date: '5hrs ago',
  },

  {
    id: 9,
    user: {
      name: 'Startup Guy',
      userName: 'buildinpublic',
      profileImage:
        'https://api.dicebear.com/9.x/notionists/png?seed=startup&backgroundColor=c0aede',
      isFollowing: false,
    },
    genre: 'Business',
    image: 'https://images.pexels.com/photos/3182763/pexels-photo-3182763.jpeg',
    link: 'https://www.instagram.com/p/DVLs8euEnlY/',
    platform: 'instagram',
    title: 'Startup Journey',
    description: 'Sharing my journey building a startup from scratch.',
    isLiked: false,
    isSaved: false,
    likes: 95,
    views: 410,
    rating: 4.0,
    myRating: 3,
    date: '4 days ago',
  },

  {
    id: 10,
    user: {
      name: 'React Master',
      userName: 'reactpro',
      profileImage:
        'https://api.dicebear.com/9.x/notionists/png?seed=react&backgroundColor=d1f4d1',
      isFollowing: true,
    },
    genre: 'Programming',
    image: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg',
    link: 'https://youtu.be/EgtbdO-qjuM',
    platform: 'youtube',
    title: 'Learn React Fast',
    description: 'Complete beginner to advanced React guide.',
    isLiked: true,
    isSaved: true,
    likes: 1200,
    views: 8000,
    rating: 4.8,
    myRating: 5,
    date: '1 week ago',
  },
];

export const sponsoredAds = [
  {
    id: 'ad_1',
    brandName: 'Spotify',
    brandLogo: 'https://logo.clearbit.com/spotify.com',
    adImage: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d',
    title: 'Stream unlimited music 🎧',
    description: 'Discover new songs every day with premium access.',
    cta: 'Install Now',
  },
  {
    id: 'ad_2',
    brandName: 'Nike',
    brandLogo: 'https://logo.clearbit.com/nike.com',
    adImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
    title: 'Just Do It',
    description: 'Upgrade your performance with latest sneakers.',
    cta: 'Shop Now',
  },
];
