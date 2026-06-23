import { Text, View } from 'react-native';

import { styles } from '../styles';

export function SignalCard({ label, value, unit }) {
  return (
    <View style={styles.signalCard}>
      <Text style={styles.signalLabel}>{label}</Text>
      <Text style={styles.signalValue}>
        {value}
        {unit ? <Text style={styles.signalUnit}> {unit}</Text> : null}
      </Text>
    </View>
  );
}
