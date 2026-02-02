import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { format } from 'date-fns';
import { RootStackParamList } from '@app/types';
import { Colors, Typography, Spacing, BorderRadius } from '@app/utils/constants';
import { useNotesStore } from '@app/store/notesStore';
import { Loading } from '@app/components';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'NoteDetail'>;

export const NoteDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { noteId } = route.params;
  const { notes, isLoading, updateNote, deleteNote } = useNotesStore();

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const note = notes.find((n) => n.id === noteId);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    }
  }, [note]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }

    try {
      await updateNote(noteId, { title, content });
      setIsEditing(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update note');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteNote(noteId);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete note');
            }
          },
        },
      ]
    );
  };

  const handleShare = () => {
    navigation.navigate('ShareNote', { noteId });
  };

  if (isLoading) {
    return <Loading fullscreen />;
  }

  if (!note) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Note not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerActions}>
          {isEditing ? (
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity onPress={() => setIsEditing(true)}>
                <Ionicons name="create-outline" size={24} color={Colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
                <Ionicons name="share-outline" size={24} color={Colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
                <Ionicons name="trash-outline" size={24} color={Colors.error} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Title */}
        {isEditing ? (
          <TextInput
            style={styles.titleInput}
            placeholder="Note Title"
            placeholderTextColor={Colors.gray400}
            value={title}
            onChangeText={setTitle}
          />
        ) : (
          <Text style={styles.title}>{note.title}</Text>
        )}

        {/* Metadata */}
        <View style={styles.metadata}>
          <Text style={styles.metadataText}>
            Created: {format(new Date(note.createdAt), 'MMM dd, yyyy HH:mm')}
          </Text>
          <Text style={styles.metadataText}>
            Updated: {format(new Date(note.updatedAt), 'MMM dd, yyyy HH:mm')}
          </Text>
          {note.isShared && (
            <View style={styles.sharedBadge}>
              <Ionicons name="people-outline" size={14} color={Colors.primary} />
              <Text style={styles.sharedText}>Shared</Text>
            </View>
          )}
        </View>

        {/* Content */}
        {isEditing ? (
          <TextInput
            style={styles.contentInput}
            placeholder="Write your note here..."
            placeholderTextColor={Colors.gray400}
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
          />
        ) : (
          <Text style={styles.noteContent}>{note.content}</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginLeft: Spacing.md,
  },
  saveButton: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.semibold,
    color: Colors.primary,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  title: {
    fontSize: Typography.size['2xl'],
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  titleInput: {
    fontSize: Typography.size['2xl'],
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    padding: 0,
  },
  metadata: {
    marginBottom: Spacing.lg,
  },
  metadataText: {
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    marginBottom: Spacing.xs,
  },
  sharedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLighter,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.base,
    alignSelf: 'flex-start',
    marginTop: Spacing.xs,
  },
  sharedText: {
    fontSize: Typography.size.xs,
    color: Colors.primary,
    marginLeft: Spacing.xs,
    fontWeight: Typography.weight.medium,
  },
  noteContent: {
    fontSize: Typography.size.base,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  contentInput: {
    fontSize: Typography.size.base,
    color: Colors.textPrimary,
    lineHeight: 24,
    minHeight: 300,
    padding: 0,
  },
});
