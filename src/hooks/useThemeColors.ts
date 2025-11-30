import { useColorScheme } from 'react-native';
import { colors } from '../theme/colors';

export const useThemeColors = () => {
    const theme = useColorScheme() ?? 'light';
    return colors[theme];
};
