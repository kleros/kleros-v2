# SimpleSquanch (SSQ)
 
The squanchy alternative to SSQ inspired by the [Varint serializer of Protocol Buffer](https://developers.google.com/protocol-buffers/docs/encoding#varints) and @metachris's [minimalistic approach](https://github.com/metachris/binary-serializer#base-128-varints). It is also an alternative to [Solidity's encodePacked()](https://docs.soliditylang.org/en/latest/abi-spec.html?highlight=encode#non-standard-packed-mode) which requires fixed-length fields and at most 1 variable-length field to decode without ambiguity.

## What is it?

A serialization scheme supporting simple binary fields of variable length. 


### Features
- Space-efficient
- Varints do not require a fixed length. 


### How does it work?
The delimitation of the fields relies on the MSB of each byte which is used as a flag to signal whether there are more bytes to process.

For example:
- If the payload fits in 7 bits (=1 byte without MSB), then the MSB is set to 0
- If the payload needs 2 or more bytes, each byte's MSB is set to 0 except the last one (from right to left).


### Limitations
- No support for complex types such as arrays, mappings or nesting.
- No concern with data types (signed/unsigned integers, strings etc), everything is bytes.


### Differences

In SSQ, the MSB flag has a different meaning:
  - In SSQ, the MSB flag means "there are more bytes after this one", assuming that they are processed from least to most significant (right to left).
  - In Protobuf and Metachris serializer, it is assumed that they are processed from the most to least significant (left to right) instead.
  - The rationale for SSQ is that it appeared to make an humble decoding implementation more straightforward.

#### Differences with Solidity abi.encodePacked()
- The only way to decode packed bytes is by knowing the fixed length of each field which is fine at one point in time, but over time the required length for a field may change. Dynamic fields lead to ambiguities.
- SSQ is not affected by the above limitation, it supports dynamic fields of arbitrary length.

#### Differences with ProtoBuf
- SSQ lacks 98% of most of ProtoBuf's features: no (proto) schema, no nesting, no optional or repeating field, no string...
- Protobuf encodes the Varint's LSB first.
- Optimized for speed, closer to the network wire order

#### Differences with Metachris binary serializer
- SSQ supports only Varints, not packages.


### Simple Specifications

Each byte uses 7 bits for the payload storage, the MSB being reserved as a "more bytes after this?" flag.
```
Bit Values: [ x | 64 | 32 | 16 | 8 | 4 | 2 | 1 ]
              | 
              + last-varint-byte indicator (0=last, 1=next-also-length-byte)
```

Therefore we can store:
- in 1 byte: any value between 0x00..0x7F
- in 2 bytes: any value between 0x00..0x3FFF 
...

There is a loss of 1 bit of storage but it is compensated by not having to either:
- reserve additional space for a Length field (to allow for variable length)
- agree on a fixed length now while attempting to predict the future possible range of values for the field.


### Specifications as code

👉 [Collab Python notebook](https://colab.research.google.com/drive/1QmRpkwmUYXBH1RPu6TTX1ZmTuZ5c1EZu#scrollTo=wvQJVfJwqOvj)


### Encoding examples

```
    input      |  [  varint byte 1  ] | [  varint byte 0  ] | [ output ]
---------------+----------------------+---------------------+--------------  
    1 = 0x0001 |                      | [ 0 0 0 0 0 0 0 1 ] |   0x0001
  127 = 0x007F |                      | [ 0 1 1 1 1 1 1 1 ] |   0x007F
  128 = 0x0080 |  [ 0 0 0 0 0 0 0 1 ] | [ 1 0 0 0 0 0 0 0 ] |   0x0180
  255 = 0x00FF |  [ 0 0 0 0 0 0 0 1 ] | [ 1 1 1 1 1 1 1 1 ] |   0x01FF
  256 = 0x0100 |  [ 0 0 0 0 0 0 1 0 ] | [ 1 0 0 0 0 0 0 0 ] |   0x0280
16383 = 0x3FFF |  [ 0 1 1 1 1 1 1 1 ] | [ 1 1 1 1 1 1 1 1 ] |   0x7FFF
     ...

    input      |  [  varint byte 2  ] | [  varint byte 1  ] | [  varint byte 0  ] | [ output ]
---------------+----------------------+---------------------+---------------------+------------  
16484 = 0x4000 |  [ 0 0 0 0 0 0 0 1 ] | [ 1 0 0 0 0 0 0 0 ] | [ 1 0 0 0 0 0 0 0 ] |  0x018080

```


