# lighthouse-out
This action sends the lighthouse assertion summary to our backend API

## Inputs

### `file`

**Required** The properties file to read from and / or write to . Default is `"./app.properties"`.

### `read-from`

A space separated list of fields to read from

### `write-to`

A space separated list of field=value pairs to write to

## Outputs

### `values`
An array of values read from fields specified with `read-from`, in the order they were specified. Available only when fields were read in with `read-from`.

## Example Usage

```bash
- name: Injest Props
  id: props
  uses: chalu/properties-io@v1
  with:
    file: ./prefs.properties
    read-from: language color size
- name: Do something with the properties
  run: echo ${{ steps.props.outputs.values[0] }}
```

