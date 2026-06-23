import { View } from 'react-native';

import { styles } from '../styles';

export function Waveform({ bars, active }) {
  return (
    <View style={styles.waveform}>
      {bars.map((value, index) => (
        <View key={`${index}-${value}`} style={styles.waveSlot}>
          <View style={[styles.waveBar, { height: `${Math.round(value * 100)}%`, opacity: active ? 1 : 0.65 }]} />
        </View>
      ))}
    </View>
  );
}
