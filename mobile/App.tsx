import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const API_BASE_URL = 'http://localhost:4000';

type LoanEntry = {
  id: number;
  friendName: string;
  phoneNumber: string;
  amount: number;
  dueDate: string;
  status: 'active' | 'repaid';
  repaidAt: string | null;
  createdAt: string;
  receiptUrl?: string | null;
};

type Summary = {
  totalLent: number;
  totalRepaid: number;
  overdueAmount: number;
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('+919876543210');
  const [otpInput, setOtpInput] = useState('');
  const [otpSent, setOtpSent] = useState('');
  const [loanList, setLoanList] = useState<LoanEntry[]>([]);
  const [summary, setSummary] = useState<Summary>({ totalLent: 0, totalRepaid: 0, overdueAmount: 0 });
  const [friendName, setFriendName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('2026-10-30');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchLoans = async () => {
    try {
      const [loansRes, summaryRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/loans`),
        fetch(`${API_BASE_URL}/api/summary`),
      ]);
      const loans = await loansRes.json();
      const summaryData = await summaryRes.json();
      setLoanList(loans);
      setSummary(summaryData);
    } catch (error) {
      console.error('Failed to load data', error);
      Alert.alert('Connection error', 'Could not connect to MiniLedger API.');
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchLoans();
    }
  }, [isLoggedIn]);

  const handleLoginRequest = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Phone number required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }
      setOtpSent(data.otp);
      Alert.alert('OTP Sent', `Mock OTP: ${data.otp}`);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Could not send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpInput.trim()) {
      Alert.alert('OTP required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, otp: otpInput }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'OTP verification failed');
      }
      Alert.alert('Login successful', data.message);
      setIsLoggedIn(true);
    } catch (error) {
      Alert.alert('Login failed', error instanceof Error ? error.message : 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntry = async () => {
    if (!friendName || !amount || !dueDate) {
      Alert.alert('Missing values', 'Friend name, amount and due date are required.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/loans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          friendName,
          phoneNumber,
          amount: Number(amount),
          dueDate,
          receiptUrl: receiptUrl.trim() || null,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Could not add loan');
      }
      setFriendName('');
      setAmount('');
      setDueDate(new Date().toISOString().slice(0, 10));
      setReceiptUrl('');
      Alert.alert('Entry added', `${data.friendName} has been added successfully.`);
      await fetchLoans();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Unable to add entry');
    } finally {
      setLoading(false);
    }
  };

  const markAsRepaid = async (loanId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/loans/${loanId}/repaid`, {
        method: 'PATCH',
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Could not mark as repaid');
      }
      await fetchLoans();
      Alert.alert('Updated', `${data.friendName} marked as repaid.`);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Request failed');
    }
  };

  const overdueCount = useMemo(
    () => loanList.filter((loan) => loan.status === 'active' && new Date(loan.dueDate) < new Date()).length,
    [loanList],
  );

  if (!isLoggedIn) {
    return (
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.authCard}>
          <Text style={styles.title}>MiniLedger</Text>
          <Text style={styles.subtitle}>Track money lent to friends</Text>

          <TextInput
            style={styles.input}
            keyboardType="phone-pad"
            placeholder="Phone number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />

          <Button title={loading ? 'Sending...' : 'Send OTP'} onPress={handleLoginRequest} disabled={loading} />

          {otpSent ? (
            <>
              <Text style={styles.otpText}>Mock OTP: {otpSent}</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="Enter OTP"
                value={otpInput}
                onChangeText={setOtpInput}
              />
              <Button title={loading ? 'Verifying...' : 'Verify OTP'} onPress={handleVerifyOtp} disabled={loading} />
            </>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={styles.appContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.metricLabel}>Total lent</Text>
            <Text style={styles.metricValue}>₹{summary.totalLent.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.metricLabel}>Total repaid</Text>
            <Text style={[styles.metricValue, styles.green]}>₹{summary.totalRepaid.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.metricLabel}>Overdue</Text>
            <Text style={[styles.metricValue, styles.red]}>₹{summary.overdueAmount.toFixed(2)}</Text>
          </View>
          <Text style={styles.overdueChip}>{overdueCount} overdue entries</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Add loan</Text>
          <TextInput style={styles.input} placeholder="Friend name" value={friendName} onChangeText={setFriendName} />
          <TextInput style={styles.input} placeholder="Phone number" value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" />
          <TextInput style={styles.input} placeholder="Amount" value={amount} onChangeText={setAmount} keyboardType="numeric" />
          <TextInput style={styles.input} placeholder="Due date (YYYY-MM-DD)" value={dueDate} onChangeText={setDueDate} />
          <TextInput style={styles.input} placeholder="Receipt URL (optional)" value={receiptUrl} onChangeText={setReceiptUrl} />
          <Button title={loading ? 'Saving...' : 'Save loan'} onPress={handleAddEntry} disabled={loading} />
        </View>

        <View style={styles.listHeaderRow}>
          <Text style={styles.sectionTitle}>Loan list</Text>
          <Pressable onPress={() => setIsLoggedIn(false)}>
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </View>

        {loanList.length === 0 ? (
          <Text style={styles.emptyText}>No loans added yet.</Text>
        ) : (
          loanList.map((loan) => {
            const isOverdue = loan.status === 'active' && new Date(loan.dueDate) < new Date();
            return (
              <View key={loan.id} style={[styles.loanCard, isOverdue && styles.overdueCard]}>
                <View style={styles.cardTopRow}>
                  <Text style={styles.friendName}>{loan.friendName}</Text>
                  <Text style={styles.amount}>₹{loan.amount.toFixed(2)}</Text>
                </View>
                <Text style={styles.metaText}>{loan.phoneNumber}</Text>
                <Text style={styles.metaText}>Due: {loan.dueDate}</Text>
                <Text style={[styles.statusText, loan.status === 'repaid' ? styles.repaidText : styles.activeText]}>
                  {loan.status === 'repaid' ? 'Repaid' : isOverdue ? 'Overdue' : 'Active'}
                </Text>
                {loan.receiptUrl ? <Text style={styles.metaText}>Receipt: {loan.receiptUrl}</Text> : null}
                {loan.status === 'active' ? (
                  <Pressable style={styles.repayButton} onPress={() => markAsRepaid(loan.id)}>
                    <Text style={styles.repayButtonText}>Mark as repaid</Text>
                  </Pressable>
                ) : null}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f5f9',
    padding: 20,
  },
  authCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 20,
    backgroundColor: '#fff',
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    backgroundColor: '#f9fafb',
    fontSize: 16,
  },
  otpText: {
    marginVertical: 12,
    fontWeight: '600',
    color: '#7c3aed',
    textAlign: 'center',
  },
  appContainer: {
    flex: 1,
    backgroundColor: '#f3f5f9',
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 40,
  },
  summaryCard: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
  },
  summaryTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metricLabel: {
    color: '#d1d5db',
    fontSize: 14,
  },
  metricValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  overdueChip: {
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#ef4444',
    color: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: '600',
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
    color: '#111827',
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  logoutText: {
    color: '#7c3aed',
    fontWeight: '600',
  },
  loanCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  overdueCard: {
    borderWidth: 1,
    borderColor: '#ef4444',
    backgroundColor: '#fff1f2',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  friendName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  metaText: {
    color: '#4b5563',
    marginBottom: 4,
  },
  statusText: {
    marginTop: 8,
    marginBottom: 8,
    fontWeight: '700',
  },
  activeText: {
    color: '#2563eb',
  },
  repaidText: {
    color: '#16a34a',
  },
  repayButton: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  repayButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  emptyText: {
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 12,
  },
  green: {
    color: '#34d399',
  },
  red: {
    color: '#f87171',
  },
});
