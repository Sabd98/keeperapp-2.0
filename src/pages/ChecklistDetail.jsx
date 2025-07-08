import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Trash2, Check, Pencil, X } from "lucide-react";
import {
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Checkbox,
  TextField,
  Box,
} from "@mui/material";
import {
  fetchChecklistItems,
  createChecklistItem,
  updateChecklistItemStatus,
  updateChecklistItemName,
  deleteChecklistItem,
} from "../store/features/checklistItemSlice";

export default function ChecklistDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const checklistItemsState = useSelector((state) => state.checklistItems);
  const items = Array.isArray(checklistItemsState.items)
    ? checklistItemsState.items
    : [];
  const status = checklistItemsState.status || "idle";  const checklist = useSelector((state) =>
    state.checklists.items.find((c) => c.id === parseInt(id))
  );

  const [newItemName, setNewItemName] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    if (id) {
      dispatch(fetchChecklistItems(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (checklistItemsState.error) {
      console.error("Checklist items error:", checklistItemsState.error);
      alert(
        `Error: ${checklistItemsState.error.message || "Failed to load items"}`
      );
    }
  }, [checklistItemsState.error]);

  const handleCreateItem = () => {
    if (newItemName.trim()) {
      dispatch(
        createChecklistItem({
          checklistId: id,
          data: { itemName: newItemName },
        })
      );
      setNewItemName("");
    }
  };

  const handleStatusChange = (itemId, currentStatus) => {
    dispatch(
      updateChecklistItemStatus({
        checklistId: id,
        itemId,
        status: !currentStatus,
      })
    );
  };

  const startEditing = (item) => {
    setEditingItem(item.id);
    setEditName(item.name);
  };

  const cancelEditing = () => {
    setEditingItem(null);
    setEditName("");
  };

  const saveEdit = () => {
    if (editName.trim() && editingItem) {
      dispatch(
        updateChecklistItemName({
          checklistId: id,
          itemId: editingItem,
          data: { itemName: editName },
        })
      );
      setEditingItem(null);
      setEditName("");
    }
  };

  const handleDeleteItem = (itemId) => {
    if (window.confirm("Delete this item?")) {
      dispatch(
        deleteChecklistItem({
          checklistId: id,
          itemId,
        })
      );
    }
  };

  if (!checklist) {
    return <div>Checklist not found</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">{checklist.name}</h2>
        <Button variant="outlined" onClick={() => navigate("/")}>
          Back to Dashboard
        </Button>
      </div>

      <Box className="mb-6 flex items-center">
        <TextField
          fullWidth
          variant="outlined"
          label="New item"
          size="300px"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleCreateItem()}
        />
        <Button
          variant="contained"
          className="ml-2"
          onClick={handleCreateItem}
          startIcon={<Plus />}
        >
          Add
        </Button>
      </Box>

      {status === "loading" ? (
        <div className="flex justify-center my-8">
          <CircularProgress />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {checklistItemsState.error
            ? "Failed to load items"
            : "No items in this checklist"}
        </div>
      ) : (
        <List className="bg-white rounded-lg shadow">
          {items.map((item) => (
            <ListItem
              key={item.id}
              secondaryAction={
                <IconButton onClick={() => handleDeleteItem(item.id)}>
                  <Trash2 size={18} />
                </IconButton>
              }
            >
              <Checkbox
                checked={item.status}
                onChange={() => handleStatusChange(item.id, item.status)}
                icon={
                  <span className="border border-gray-400 rounded w-5 h-5" />
                }
                checkedIcon={
                  <Check className="bg-blue-500 text-white rounded w-5 h-5" />
                }
              />

              {editingItem === item.id ? (
                <div className="flex items-center flex-grow">
                  <TextField
                    fullWidth
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && saveEdit()}
                  />
                  <IconButton onClick={saveEdit} className="ml-2">
                    <Check size={18} />
                  </IconButton>
                  <IconButton onClick={cancelEditing} className="ml-1">
                    <X size={18} />
                  </IconButton>
                </div>
              ) : (
                <ListItemText
                  primary={item.name}
                  className={item.status ? "line-through text-gray-500" : ""}
                  onClick={() => startEditing(item)}
                  style={{ cursor: "pointer" }}
                />
              )}
            </ListItem>
          ))}
        </List>
      )}
    </div>
  );
}
