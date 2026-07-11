import React, { useRef, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  useWindowDimensions,
  SafeAreaView,
  StatusBar,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowRight, ChevronLeft } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  useAnimatedScrollHandler,
  Easing,
  FadeInUp,
  FadeIn,
  SlideInDown,
  SharedValue,
} from 'react-native-reanimated';
import { Colors } from '../constants/Colors';
import { Button } from '../components/Button';
import { PageIndicator } from '../components/PageIndicator';
import { Onboarding1 } from '../components/illustrations/Onboarding1';
import { Onboarding2 } from '../components/illustrations/Onboarding2';
import { Onboarding3 } from '../components/illustrations/Onboarding3';

interface SlideItem {
  id: string;
  headline: string;
  description: string;
  illustration: React.ReactNode;
}

function Slide({
  item,
  index,
  windowWidth,
  scrollX,
  colors,
}: {
  item: SlideItem;
  index: number;
  windowWidth: number;
  scrollX: SharedValue<number>;
  colors: { primary: string; textMuted: string };
}) {
  const inputRange = [
    (index - 1) * windowWidth,
    index * windowWidth,
    (index + 1) * windowWidth,
  ];

  const illustrationStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          scrollX.value,
          inputRange,
          [windowWidth * 0.3, 0, -windowWidth * 0.3]
        ),
      },
    ],
  }));

  const textOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(scrollX.value, inputRange, [0.3, 1, 0.3]),
  }));

  const textTranslateY = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(scrollX.value, inputRange, [40, 0, 40]),
      },
    ],
  }));

  return (
    <View style={[styles.slideContainer, { width: windowWidth }]}>
      <Animated.View style={[styles.illustrationWrapper, illustrationStyle]}>
        {item.illustration}
      </Animated.View>

      <Animated.View style={[styles.textContainer, textOpacity, textTranslateY]}>
        <Text style={[styles.headline, { color: colors.primary }]}>
          {item.headline}
        </Text>
        <Text style={[styles.description, { color: colors.textMuted }]}>
          {item.description}
        </Text>
      </Animated.View>
    </View>
  );
}

export default function OnboardingScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[theme];
  const { width: windowWidth } = useWindowDimensions();

  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList<SlideItem>>(null);
  const scrollX = useSharedValue(0);

  const slides: SlideItem[] = [
    {
      id: 'slide-1',
      headline: 'Natural Healing Starts Here',
      description: 'Discover trusted herbal knowledge inspired by Ghanaian traditions and modern wellness.',
      illustration: <Onboarding1 />,
    },
    {
      id: 'slide-2',
      headline: 'Learn Safe Natural Remedies',
      description: 'Explore remedies for everyday wellness, understand how they are prepared, and learn when they should be used safely.',
      illustration: <Onboarding2 />,
    },
    {
      id: 'slide-3',
      headline: 'Build Healthy Habits',
      description: 'Save your favorite remedies, keep a wellness journal, and receive helpful daily wellness tips.',
      illustration: <Onboarding3 />,
    },
  ];

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const handleNext = useCallback(() => {
    if (activeIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: activeIndex + 1,
        animated: true,
      });
      setActiveIndex(activeIndex + 1);
    }
  }, [activeIndex, slides.length]);

  const handleBack = useCallback(() => {
    if (activeIndex > 0) {
      flatListRef.current?.scrollToIndex({
        index: activeIndex - 1,
        animated: true,
      });
      setActiveIndex(activeIndex - 1);
    }
  }, [activeIndex]);

  const handleSkipOrStart = useCallback(() => {
    router.replace('/interests' as any);
  }, [router]);

  const onMomentumScrollEnd = useCallback(
    (event: any) => {
      const contentOffset = event.nativeEvent.contentOffset.x;
      const index = Math.round(contentOffset / windowWidth);
      if (index >= 0 && index < slides.length) {
        setActiveIndex(index);
      }
    },
    [windowWidth, slides.length]
  );

  const renderItem = useCallback(
    ({ item, index }: { item: SlideItem; index: number }) => (
      <Slide item={item} index={index} windowWidth={windowWidth} scrollX={scrollX} colors={{ primary: colors.primary, textMuted: colors.textMuted }} />
    ),
    [windowWidth, scrollX, colors]
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />

      <Animated.FlatList<SlideItem>
        ref={flatListRef as any}
        data={slides}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onScroll={scrollHandler}
        keyExtractor={(item) => item.id}
        bounces={false}
        scrollEventThrottle={16}
        style={styles.flatList}
      />

      <Animated.View
        style={styles.bottomWrapper}
        entering={FadeInUp.delay(200).duration(500).springify()}
      >
        <PageIndicator count={slides.length} activeIndex={activeIndex} />

        <Animated.View
          style={styles.buttonRow}
          entering={SlideInDown.delay(300).duration(400).springify().damping(25)}
        >
          {activeIndex === 0 ? (
            <>
              <Button
                title="Skip"
                variant="text"
                onPress={handleSkipOrStart}
                style={styles.flexButton}
              />
              <Button
                title="Next"
                variant="primary"
                onPress={handleNext}
                style={styles.flexButton}
                icon={<ArrowRight size={18} color={theme === 'dark' ? '#141210' : '#F9F6F1'} />}
              />
            </>
          ) : activeIndex === 1 ? (
            <>
              <Button
                title="Back"
                variant="secondary"
                onPress={handleBack}
                style={styles.flexButton}
                icon={<ChevronLeft size={18} color={colors.primary} />}
              />
              <Button
                title="Next"
                variant="primary"
                onPress={handleNext}
                style={styles.flexButton}
                icon={<ArrowRight size={18} color={theme === 'dark' ? '#141210' : '#F9F6F1'} />}
              />
            </>
          ) : (
            <>
              <Button
                title="Back"
                variant="secondary"
                onPress={handleBack}
                style={styles.flexButton}
                icon={<ChevronLeft size={18} color={colors.primary} />}
              />
              <Button
                title="Get Started"
                variant="primary"
                onPress={handleSkipOrStart}
                style={styles.flexButton}
                icon={<ArrowRight size={18} color={theme === 'dark' ? '#141210' : '#F9F6F1'} />}
              />
            </>
          )}
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flatList: {
    flex: 1,
  },
  slideContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  illustrationWrapper: {
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  textContainer: {
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  headline: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 28,
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 16,
  },
  description: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  bottomWrapper: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    minHeight: 56,
  },
  flexButton: {
    flex: 1,
  },
});
